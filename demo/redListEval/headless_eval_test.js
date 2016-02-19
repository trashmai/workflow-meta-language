#!/usr/bin/env node
'use strict';
if (require.main !== module) {
    throw new Error('This is not a requirable module. Use child_process to launch this module!');
}

var os = require('os');
var path = require('path');
var rmraf = require('rimraf');
var spawn = require('child_process').spawn;
var whichSync = require('which').sync;
var Xvfb = require('xvfb');

// Chromium's output line format is defined as
// [pid:tid:MMDD/hhmmss:tickcount:severity:source(lineno)] LOGMESSAGEHERE
// pid, tid, tickcount are optional. For the console, source is always "CONSOLE".
// http://src.chromium.org/viewvc/chrome/trunk/src/base/logging.cc?revision=265460&view=markup#l674
var r_logMessageFormat = new RegExp(
    '^\\[' +
    // pid and tid are optional
    '(?:\\d+:){0,2}' +
    // We don't care about the date
    '\\d{4}/\\d{6}:' +
    // tickcount is optional
    '(?:\\d+:)?' +
    // Log severity = $1
    '(INFO|WARNING|ERROR|ERROR_REPORT|FATAL|VERBOSE\\d*|UNKNOWN)' +
    // source = $2 and line number = $3
    ':(.*?)\\((\\d+)\\)' +
    '\\] ' +
    // Rest of line = $4
    '(.*)$'
);
// Which non-console messages should also be printed to stdout?
// By default, only errors are forwarded.
var r_logMessageSeverity = 'LOG_CR_VERBOSITY' in process.env ?
                         new RegExp(process.env.LOG_CR_VERBOSITY) :
                         /ERROR_REPORT|FATAL/; 
// Ignore error messages from Chromium.
// By default, all error messages from Chrome are printed as well.
// If you want to hide all messages, set LOG_CR_HIDE_PATTERN=.
var r_logMessageIgnore = 'LOG_CR_HIDE_PATTERN' in process.env ? 
                         new RegExp(process.env.LOG_CR_HIDE_PATTERN, 'i') :
                         /kwallet/i;

// Patterns to be stripped from console messages.
var r_logMessageConsoleStart = /^"/;
var r_logMessageConsoleEnd = /", source: .*? \(\d+\)$/;

// Magic byte sequence at the end of a console message to signal that the
// line has not ended yet.
var NOT_END_OF_LINE = '\x03\b';


// Locate Chromium and determine flags to be used..
var chromiumBinary;
try {
    whichSync(chromiumBinary = 'chromium');
} catch (e) {
    try {
        whichSync(chromiumBinary = 'google-chrome');
    } catch (e) {
        whichSync(chromiumBinary = 'chromium-browser');
    }
}

try {
    whichSync('Xvfb');
} catch (e) {
    console.error('Xvfb not found. Please install xvfb before trying again.');
    process.exit(-1);
}

var chromiumFlags = process.argv.slice(2);
var userDataDir = path.join(os.tmpdir(), 'chromium_headless_user_data_directory' + Math.random());
(function checkFlagsToBePassedToChromium() {
    if (!chromiumFlags.length) {
        console.log('Usage: ' + process.argv[1].split('/').pop() + ' flags passed to Chromium');
        console.log('Require at least one flag');
        process.exit(-1);
    }
    if (!hasFlag('user-data-dir')) {
        chromiumFlags.push('--no-first-run');
        chromiumFlags.push('--user-data-dir=' + userDataDir);
    }
    if (!hasFlag('allow-file-access-from-files')) {
        chromiumFlags.push('--allow-file-access-from-files');
    }
    // Direct error messages to stderr. Use verbosity at minimum 1 to catch
    // JavaScript console messages.
    chromiumFlags.push('--enable-logging=stderr');
    if (!hasFlag('v')) {
        chromiumFlags.push('--v=1');
    }

    function hasFlag(flagname) {
        return process.argv.some(function(flag) {
            flag = flag.split('=', 1)[0];
            return flag == '--' + flagname;
        });
    }
})();


// Start the virtual X Framebuffer
var xvfb = new Xvfb({
    silent: true,
    // Use the same parameters as used by Chromium's test bots:
    // https://src.chromium.org/viewvc/chrome/trunk/tools/build/scripts/slave/xvfb.py?revision=233700&#l75
    xvfb_args: [
        '-screen',
        '0',
        '1024x768x24',
        '-ac'
    ]
});
xvfb.start(function(err, xvfbProcess) {
    if (err) {
        console.error('Failed to start Xvfb: ' + err);
        process.exit(-1);
        return;
    }

    console.log('Starting Chromium...');

    // Let's start Chromium...
    var crProcess = spawn(chromiumBinary, chromiumFlags);
    var crProcessExited = false;
    crProcess.on('exit', function() {
        crProcessExited = true;
        quitXvfbAndChromium(-1);
    });
    _toggle_crProcessEvents(true);
    function _toggle_crProcessEvents(register) {
        var methodName = register ? 'on' : 'removeListener';
        crProcess.stdout[methodName]('data', handleOutput);
        crProcess.stderr[methodName]('data', handleOutput);
        crProcess.stdout[methodName]('end', flushBuffer);
        crProcess.stderr[methodName]('end', flushBuffer);
    }

    var buffer = '';
    function handleOutput(chunk) {
        var lines = (buffer + chunk).split('\n');
        // The last character must be a newline. If it is not a newline, then the
        // chunk is probably not complete, queue it for the next data event.
        buffer = lines.pop();

        // Parse and print all lines if needed.
        lines.forEach(printLine);
    }

    function flushBuffer() {
        if (buffer) {
            printLine(buffer);
        }
    }

    function printJsConsoleMessage(msg) {
        var stdout_msg = msg.slice(0, -NOT_END_OF_LINE.length);
        if (stdout_msg == NOT_END_OF_LINE) {
            process.stdout.write(stdout_msg);
        }
        else {
            console.log(msg);
            if (msg == 'workflow done') {
              // Mai
              quitXvfbAndChromium(0);
            }
        }
    }

    // Whether the last line was a message written to the JavaScript console.
    var isJSConsole = false;
    // Whether the last line is output from Chromium that is printed to stdout.
    // True by default, so that output from e.g. --version is always printed.
    var isAllowedOutput = true;
    function printLine(line) {
        var parsedline = r_logMessageFormat.exec(line);
        if (!parsedline) {
            // Continuation of last log message or end of line.
            if (isJSConsole) {
                line = line.replace(r_logMessageConsoleEnd, '');
                printJsConsoleMessage(line);
            }
            else if (isAllowedOutput && !r_logMessageIgnore.test(line)) {
                console.log(line);
            }
            return;
        }
        var log_severity = parsedline[1];
        var log_source = parsedline[2];
        var log_lineno = parsedline[3];
        var log_message = parsedline[4];

        isJSConsole = log_source == 'CONSOLE';
        if (isJSConsole) {
            // Forward all JS console messages to stdout.
            log_message = log_message.replace(r_logMessageConsoleStart, '');
            log_message = log_message.replace(r_logMessageConsoleEnd, '');
            printJsConsoleMessage(log_message);

            if (log_severity == 'INFO') {
                var completionMessage = /^All tests completed!(-?\d*)$/.exec(log_message);
                if (completionMessage) {
                    var exitCode = completionMessage[1] & 0xFF;
                    quitXvfbAndChromium(exitCode);
                }
            }
        }
        else {
            // Ignore non-JS console messages
            // Ok, show Chrome errors if they appear, to prevent having failures and
            // no debugging information at all.
            isAllowedOutput = r_logMessageSeverity.test(log_severity) && !r_logMessageIgnore.test(log_message);
            if (isAllowedOutput) {
                console.log(log_severity + ':' + log_source + '(' + log_lineno + '): ' + log_message);
            }
        }
    }

    var hasQuitChromium = false;
    function quitXvfbAndChromium(exitCode) {
        if (hasQuitChromium) {
            return;
        }
        hasQuitChromium = true;

        _toggle_crProcessEvents(false);
        xvfb.stop(function(err) {
            if (err) {
                console.error('Failed to stop Xvfb: ' + err);
            }
            if (!crProcessExited) {
                console.error('Chromium process was still alive. Sending SIGKILL...');
                crProcess.kill('SIGKILL');
            }
            rmraf(userDataDir, function(err) {
                if (err) {
                    console.error('Failed to remove ' + userDataDir + ': ' + err);
                }
                process.exit(exitCode);
            });
        });
    }
});

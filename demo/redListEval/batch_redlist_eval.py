#!/usr/bin/env python

# Batch running redlist evaluation with help of headless chrome
# Dependency:
# Python (of course)
# Chrome
# Chrome webdriver
# Selenium
# Xvfb

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.common.exceptions import WebDriverException
from xvfbwrapper import Xvfb

col = 3
max_col = 161

def ajax_complete(driver):
  global col, max_col
  try:
    # print driver.execute_script("return !!localStorage.redListVars")
    if 'workflow done' == driver.execute_script("return jQuery('#workflow_done_assertion').html()"):
      print str(col) + ':' + driver.execute_script("return jQuery('#workflow_result').html()")
      if col < max_col:
        col += 1
        ajax_automation_test(col)
      return True
    return False
  except WebDriverException:
    pass
 
def ajax_automation_test(col):
  global chrome_driver
  chrome_driver.get("http://twebi.net/workflow/demo/redListEval/no-cy.html?ns=B&col=" + str(col))

  #wait for ajax items to load
  WebDriverWait(chrome_driver, 10).until(
    ajax_complete, "Timeout waiting for page to load")
 
  assert "workflow.js" in chrome_driver.page_source

with Xvfb() as xvfb:
  chrome_driver = webdriver.Chrome('/opt/bin/chromedriver')  # Optional argument, if not specified will search path.
  ajax_automation_test(col)



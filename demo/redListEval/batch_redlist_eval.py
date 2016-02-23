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
import json

criterias = ['A', 'B', 'C', 'D']
current_criteria = ''
res = []
start_from = 3

def create_on_exist_update(haystack, dict_id, needle, key, value, new_element):
  index = next((i for i, x in enumerate(haystack) if x[dict_id] == needle), -1)
  if key != dict_id and index != -1:
    haystack[index][key] = value
  else:
    haystack.append(new_element)
  return haystack

def ajax_complete(driver):
  global col, max_col, res, current_criteria
  try:
    # print driver.execute_script("return !!localStorage.redListVars")
    if 'workflow done' == driver.execute_script("return jQuery('#workflow_done_assertion').html()"):
      species_mix = driver.execute_script("return jQuery('#redlist_species').html()").split('|')
      if ("" == species_mix[0]) and ("" == species_mix[1]):
        return True
      result = driver.execute_script("return jQuery('#workflow_result').html()")
      newEle = {}
      newEle['species'] = species_mix[0]
      newEle['species_sci'] = species_mix[1]
      newEle['col'] = col
      newEle[current_criteria] = result
      res = create_on_exist_update(haystack=res, dict_id='species', needle=species_mix[0] ,key=current_criteria, value=result, new_element=newEle)
      # print(json.dumps(newEle, ensure_ascii=False))

      col += 1
      ajax_automation_test(current_criteria, col)

      return True

    return False

  except WebDriverException:
    pass
 
def ajax_automation_test(criteria, col):
  global chrome_driver
  chrome_driver.get("http://twebi.net/workflow/demo/redListEval/no-cy.html?ns=" + criteria + "&col=" + str(col))
  #wait for ajax items to load
  WebDriverWait(chrome_driver, 10).until(
    ajax_complete, "Timeout waiting for page to load")
  assert "workflow.js" in chrome_driver.page_source

with Xvfb() as xvfb:
  chrome_driver = webdriver.Chrome('/opt/bin/chromedriver')  # Optional argument, if not specified will search path.
  for cri in criterias:
    col = start_from
    current_criteria = cri
    ajax_automation_test(cri, col)
  print(json.dumps(res))
  chrome_driver.quit()

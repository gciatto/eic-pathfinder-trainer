"""Browser smoke tests for the source-grounded 2026 trainer."""
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
try:
 with sync_playwright() as p:
  browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox'])
  page=browser.new_page(viewport={'width':1330,'height':910},device_scale_factor=1)
  errors=[]
  page.on('pageerror',lambda e: errors.append(str(e)))
  html=(ROOT/'index.html').read_text().replace('<link rel="stylesheet" href="style.css">','<style>'+ (ROOT/'style.css').read_text() +'</style>').replace('<script src="questions.js"></script>','<script>'+ (ROOT/'questions.js').read_text() +'</script>').replace('<script src="app.js"></script>','<script>'+ (ROOT/'app.js').read_text() +'</script>')
  page.set_content(html,wait_until='load')
  assert page.locator('#home-metrics .metric').count()==4
  assert '74' in page.locator('#home-metrics').inner_text()
  assert page.locator('#part-cards .part-card').count()==5
  page.screenshot(path=str(ROOT/'tests'/'overview.png'),full_page=True)
  page.locator('[data-page="bank"]').click()
  assert page.locator('.bank-card').count()==74
  page.locator('#bank-part').select_option('B')
  assert page.locator('.bank-card').count()==20
  page.locator('#bank-part').select_option('all')
  assert page.locator('.bank-card').count()==74
  page.locator('#search-questions').fill('allocation of resources')
  assert page.locator('.bank-card').count()>=1
  page.locator('#search-questions').fill('')
  page.locator('[data-start-part="A"]').click()
  assert page.locator('#filter-part').input_value()=='A'
  page.locator('#shuffle-questions').uncheck()
  page.locator('#session-count').select_option('all')
  page.locator('#start-practice').click()
  assert 'PART A · QUESTION 1' in page.locator('#question-label').inner_text()
  assert page.locator('.answer-option').count()==5
  page.locator('.answer-option').nth(4).click()
  assert 'All of the above' in page.locator('.answer-option').nth(4).inner_text()
  page.locator('#check-question').click()
  assert 'Correct answer' in page.locator('#feedback').inner_text()
  assert 'Official answer: E' in page.locator('#feedback').inner_text()
  page.screenshot(path=str(ROOT/'tests'/'practice.png'),full_page=True)
  page.locator('#bookmark-question').click()
  assert 'Bookmarked' in page.locator('#bookmark-question').inner_text()
  page.locator('#next-question').click()
  assert 'PART A · QUESTION 2' in page.locator('#question-label').inner_text()
  page.once('dialog',lambda dialog:dialog.accept())
  page.locator('#abandon-session').click()
  assert page.locator('#session-setup').is_visible()
  page.locator('[data-start-part="B"]').click()
  page.locator('#shuffle-questions').uncheck()
  page.locator('#session-count').select_option('all')
  page.locator('#start-exam').click()
  for i in range(15):
   assert 'QUESTION '+str(i+1)+' / 20' in page.locator('#question-position').inner_text()
   page.locator('.answer-option').first.click()
   page.locator('#check-question').click()
  assert 'PART B · QUESTION 16' in page.locator('#question-label').inner_text()
  assert 'SELECT ALL THAT APPLY' in page.locator('#question-kind').inner_text()
  assert page.locator('.answer-option').count()==5
  page.locator('.answer-option').nth(1).click()
  page.locator('.answer-option').nth(3).click()
  assert page.locator('.answer-option.selected').count()==2
  assert page.locator('.answer-option.selected .answer-letter').all_text_contents()==['B','D']
  page.locator('#previous-question').click()
  page.locator('#check-question').click()
  assert page.locator('.answer-option.selected .answer-letter').all_text_contents()==['B','D']
  page.locator('#check-question').click()
  for i in range(17,21):
   assert 'QUESTION '+str(i)+' / 20' in page.locator('#question-position').inner_text()
   page.locator('.answer-option').first.click()
   page.locator('#check-question').click()
  assert page.locator('#session-results').is_visible()
  assert page.locator('#results-review .result-row').count()==20
  page.locator('[data-page="progress"]').click()
  assert page.locator('#missed-items .simple-question').count()>0
  assert page.locator('#bookmarked-items .simple-question').count()==1
  assert 'A' in page.locator('#part-progress-bars').inner_text()
  page.locator('[data-page="settings"]').click()
  assert page.locator('#sources-list .source-row').count()==7
  assert page.locator('#sources-list a').count()==7
  assert not errors,errors
  print('Project version: browser smoke tests passed.')
  mobile=browser.new_page(viewport={'width':390,'height':844},device_scale_factor=1)
  mobile.set_content(html,wait_until='load')
  assert mobile.locator('#part-cards .part-card').count()==5
  assert mobile.evaluate('document.body.scrollWidth <= window.innerWidth+2'), 'Unexpected horizontal overflow on mobile'
  mobile.screenshot(path=str(ROOT/'tests'/'mobile.png'),full_page=True)
  print('Mobile version: browser smoke tests passed.')
  single=browser.new_page(viewport={'width':1280,'height':900})
  single.set_content((ROOT/'standalone.html').read_text(),wait_until='load')
  assert single.locator('#part-cards .part-card').count()==5
  single.locator('[data-page="bank"]').click()
  assert single.locator('.bank-card').count()==74
  print('Standalone version: browser smoke tests passed.')
  browser.close()
finally:
 pass

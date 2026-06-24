/**
 * Sugandh Ink - Supabase Keep-Alive Script
 *
 * Prevents Supabase from pausing after 7 days of inactivity.
 *
 * HOW TO SET UP:
 *   1. Go to https://script.google.com
 *   2. Create a New Project
 *   3. Paste this entire file into Code.gs
 *   4. Replace YOUR_SITE_URL below with your actual domain
 *   5. Save (Cmd+S)
 *   6. In the toolbar, select setupTrigger from the dropdown and click Run
 *   7. Authorize the script (it needs permission to create triggers and fetch URLs)
 *   8. Done — the trigger will ping your site every 4 days
 *
 * TO DELETE ALL TRIGGERS:
 *   Run the deleteAllTriggers() function from the dropdown.
 */

var SITE_URL = 'https://YOUR_SITE_URL.com/api/health';

function pingSite() {
  try {
    var response = UrlFetchApp.fetch(SITE_URL, { muteHttpExceptions: true });
    Logger.log('Ping success: ' + response.getContentText());
  } catch (e) {
    Logger.log('Ping failed: ' + e.message);
  }
}

function setupTrigger() {
  deleteAllTriggers();
  ScriptApp.newTrigger('pingSite')
    .timeBased()
    .everyDays(4)
    .atHour(9)
    .nearMinute(15)
    .create();
  Logger.log('Trigger created: pings ' + SITE_URL + ' every 4 days at ~9:15 AM');
}

function deleteAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) { ScriptApp.deleteTrigger(t); });
  Logger.log('Deleted ' + triggers.length + ' existing trigger(s)');
}

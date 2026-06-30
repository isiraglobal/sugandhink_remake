/**
 * Sugandh Ink - Supabase Keep-Alive Script
 *
 * Prevents Supabase from pausing after 7 days of inactivity.
 * Pings Supabase REST API directly every 4 days.
 *
 * HOW TO SET UP:
 *   1. Go to https://script.google.com
 *   2. Create a New Project
 *   3. Paste this entire file into Code.gs
 *   4. Save (Cmd+S)
 *   5. In the toolbar, select setupTrigger from the dropdown and click Run
 *   6. Authorize the script (it needs permission to create triggers and fetch URLs)
 *   7. Done — no domain or config needed
 *
 * TO DELETE ALL TRIGGERS:
 *   Run deleteAllTriggers() from the dropdown.
 */

var SUPABASE_URL = 'https://wqxugmhwmepngbzftxmq.supabase.co';
var SUPABASE_KEY = 'sb_publishable_QVdxHYeZD2iP8O5yBEp-vw_ckagQo70';

function pingSupabase() {
  var url = SUPABASE_URL + '/rest/v1/products?select=count&head=true';
  var headers = {
    apikey: SUPABASE_KEY,
    Authorization: 'Bearer ' + SUPABASE_KEY
  };
  var params = { headers: headers, muteHttpExceptions: true };
  try {
    var response = UrlFetchApp.fetch(url, params);
    Logger.log('Ping success: ' + response.getResponseCode());
  } catch (e) {
    Logger.log('Ping failed: ' + e.message);
  }
}

function setupTrigger() {
  deleteAllTriggers();
  ScriptApp.newTrigger('pingSupabase')
    .timeBased()
    .everyDays(4)
    .atHour(9)
    .nearMinute(15)
    .create();
  Logger.log('Trigger created — pings Supabase directly every 4 days at ~9:15 AM');
}

function deleteAllTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(t) { ScriptApp.deleteTrigger(t); });
  Logger.log('Deleted ' + triggers.length + ' existing trigger(s)');
}

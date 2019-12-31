/* 
 * Application : CICD Integration
 * ClassName   : sys_ui_action
 * Created On  : 2019-02-05 15:23:32
 * Created By  : b.moers
 * Updated On  : 2019-11-21 18:29:04
 * Updated By  : admin
 * URL         : /sys_ui_action.do?sys_id=3ee71f77db57a7801af8b14ffe9619c2
 */
// new global.CiCdRun().sys_appUiAction(current);
// action.setRedirectURL(current);
function displayUpdateSet(){
   //Open a dialog window to select Approval Groups
   var dialog = new GlideDialogWindow('UpdateSets',false,900);
   dialog.setTitle('Select Deployment Type');
   dialog.setPreference('sysparm_message', 'current');
   dialog.render();
	
   //Make sure to not submit the form when button gets clicked
   //return false;
}

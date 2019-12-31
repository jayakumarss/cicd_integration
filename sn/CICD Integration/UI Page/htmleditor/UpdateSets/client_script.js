/* 
 * Application : CICD Integration
 * ClassName   : sys_ui_page
 * Created On  : 2019-11-12 13:59:34
 * Created By  : admin
 * Updated On  : 2019-11-25 19:05:58
 * Updated By  : admin
 * URL         : /sys_ui_page.do?sys_id=3262050adb010010343f58b3ca961960
 */
var deploymentType;

function getDeploymentType(){
	var e = document.getElementById("categorySelect");
	deploymentType = e.options[e.selectedIndex].value;
	var x = document.getElementById("updateSet");
	if (deploymentType==2 && x.style.display === "none") {
		x.style.display = "block";
	} else {
		x.style.display = "none";
	}
	
}
function triggerBuild(appId,sysId,name,scope){
	
	
	if(deploymentType==1){
		
		var applicaitonDep = new GlideAjax('CiCDUpdateStatus');//this is the script include
		applicaitonDep.addParam("sysparm_name", "deployUIAction"); //this is the function within the script include
		applicaitonDep.addParam("appId", appId);
		
		applicaitonDep.getXML(deploymentResponse);
	}
	
	else{
		var updateSetSysId = sb.getValues(sb.getRightSelect());
		var updateSetId = updateSetSysId.shift();
		if(updateSetSysId.length==1){
							var singleUpdateSet = new GlideAjax('CiCDUpdateStatus');//this is the script include
						singleUpdateSet.addParam("sysparm_name", "executeDeployment"); //this is the function within the script include
						singleUpdateSet.addParam("sysId", updateSetSysId[0]);
						singleUpdateSet.getXML(deploymentResponse);
		}else{
		var ga = new GlideAjax('CiCDUpdateStatus');//this is the script include
		ga.addParam("sysparm_name", "createBatchUpdateSet"); //this is the function within the script include
		ga.addParam("sysId", updateSetSysId);
		ga.getXML(deploymentResponse);
	}}
	// 	else{
		// 		var updateSetSysId = sb.getValues(sb.getRightSelect());
		// 	var updateSetId = updateSetSysId.shift();
		// 	for( var i=0; i<updateSetSysId.length; i++ )
		// 		{
			
			
			
			// 			var ga = new GlideAjax('CiCDUpdateStatus');//this is the script include
			// 			ga.addParam("sysparm_name", "executeDeployment"); //this is the function within the script include
			// 			ga.addParam("sysId", updateSetSysId[i]);
			// 			ga.getXML(deploymentResponse);
			
			// 	}
			// 	}
		}
		function deploymentResponse(response) {
			var answer = response.responseXML.documentElement.getAttribute("answer");
			// 	alert(answer);
		}
		

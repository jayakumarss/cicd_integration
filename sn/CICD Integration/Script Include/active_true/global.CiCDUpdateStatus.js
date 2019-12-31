/* 
 * Application : CICD Integration
 * ClassName   : sys_script_include
 * Created On  : 2019-11-12 19:06:30
 * Created By  : admin
 * Updated On  : 2019-11-26 18:10:51
 * Updated By  : admin
 * URL         : /sys_script_include.do?sys_id=249802cadbc10010343f58b3ca961955
 */
var CiCDUpdateStatus = Class.create();
CiCDUpdateStatus.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	createBatchUpdateSet : function() {
		gs.info("1 Inside Script include----   "+ SNC.Apps.generateUpdateSetName() );
		var appId;
		var sysIdStr = this.getParameter('sysId');
		var sysIds = sysIdStr.split(',');
		gs.info("2 Sys ID Length....."+sysIds.length);
		var applicationSysId = new GlideRecord('sys_update_set');
		applicationSysId.addQuery('sys_id', sysIds[0]);
		applicationSysId.query();
		if(applicationSysId.next()) {
			appId = applicationSysId.getValue('application');
			gs.info( "3 app id Get the updated status....."+ appId);
		}
		var usm = new GlideUpdateManager2();
		var gus = new GlideUpdateSet();
		var currentUS = gus.get();
		var sc = new GlideRecord('sys_app');
		if (!sc.get(appId))
			throw Error("application not found");
		
	//	var sysId = new GlideChecksum(sc.getValue('name').concat(sc.getValue('version'), sc.getValue('sys_id'), gs.getProperty('instance_name'))).getMD5();
		//gs.info("4 New Sys Id"+ sysId);
		var updateSetRecord;
		var us = new GlideRecord('sys_update_set');
		gs.info('[CICD Update Status] Before');
// 		if (us.get(sysId)) {
// 			gs.info('[CICD Update Status] Deleting existing version of this update set {0}', sysId.toString());
// 				us.deleteRecord();
// 			}
			us.newRecord();
			//us.setValue('sys_id', sysId);
			us.setValue('name',SNC.Apps.generateUpdateSetName());
			us.setValue('application', appId);
			
			us.setValue('description', 'Automatically created by CICD Process'.concat(sc.getValue('short_description') ? '\n'.concat(sc.getValue('short_description')) : ''));
			var updateSetSysId = us.insert();
			
			// make new update-set active
			gus.set(updateSetSysId);
		var sysId = us.getValue('sys_id');
		gs.info('Generated sys id.............'+sysId);
			for(var i=0; i<sysIds.length; i++){
				
				updateSetRecord = new GlideRecord('sys_update_set');
				updateSetRecord.addQuery('sys_id', sysIds[i]);
				updateSetRecord.query();
				if(updateSetRecord.next()) {
					updateSetRecord.setValue('parent',sysId);
					updateSetRecord.update('CICD Build');
					updateSetRecord.setValue('state','complete');
					updateSetRecord.update('Child updateset updated');
					gs.info("Get the updated updateset status....."+ updateSetRecord.getValue('state'));
					
				}
				
			}
			us.setValue('state', 'complete');
			us.update('updated statues');
			gs.info(us.getValue('sys_id')+"Get the updated updateset status of Batch....."+ us.getValue('state'));
			return 'Batch Created';
		},
		executeDeployment : function() {
			gs.info("Inside execute Deployment Step");
			
			var sysId = this.getParameter('sysId');
			gs.info("Sys ID....."+sysId);
			var updateSetRecord = new GlideRecord('sys_update_set');
			updateSetRecord.addQuery('sys_id', sysId);
			updateSetRecord.query();
			if(updateSetRecord.next()) {
				updateSetRecord.setValue('state','complete');
				updateSetRecord.update('CICD Build');
				gs.info("Get the updated updateset status....."+ updateSetRecord.getValue('state'));
				return 'Build Triggered';
			}
			return 'Build Started';
		},
		
		batchUpdateSet: function () {
			var self = this;
			var sysIdStr = self.getParameter('sysId');
			var appId;
			var sysIds = sysIdStr.split(',');
			gs.info('Step 1. Sys ID length'+sysIds.length);
			var applicationSysId = new GlideRecord('sys_update_set');
			
			applicationSysId.addQuery('sys_id', sysIds[0]);
			applicationSysId.query();
			if(applicationSysId.next()) {
				appId = applicationSysId.getValue('application');
				
				gs.info( "Step 2. app id Get the updated status....."+ appId);
				
			}
			if (!gs.getUser().getRoles().contains('admin'))
				throw Error('User must have admin grants.');
			
			var sc = new GlideRecord('sys_app');
			if (!sc.get(appId))
				throw Error("application not found");
			
			// the sysId of the update set
			var sysId = new GlideChecksum(sc.getValue('name').concat(sc.getValue('version'), sc.getValue('sys_id'), gs.getProperty('instance_name'))).getMD5();
			var singleUpdateSet = Boolean(gs.getProperty('cicd-integration.scoped-app.single-update-set', 'false') == 'true');
			
			
			
			var usm = new GlideUpdateManager2();
			var gus = new GlideUpdateSet();
			var currentUS = gus.get();
			
			
			//gs.setCurrentApplicationId(appId);
			gs.info('Step 3. Before Query Store initialize');
			var queryStore = {};
				// add scope to update set
				queryStore[sc.getRecordClassName()] = [appId];
				gs.info('Step 4. After Query Store initialize');
				self.console.info('[publishToUpdateSet] create new update set');
				var us = new GlideRecord('sys_update_set');
				if (singleUpdateSet) {
					if (us.get(sysId)) {
						self.console.info('[publishToUpdateSet] Deleting existing version of this update set {0}', sysId.toString());
							gs.info('[publishToUpdateSet] Deleting existing version of this update set {0}', sysId.toString());
								us.deleteRecord();
							}
							us.newRecord();
							us.setValue('sys_id', sysId);
						} else {
							us.initialize();
						}
						us.setValue('name', sc.getValue('name').concat(' - ', sc.getValue('version')));
						us.setValue('application', appId);
						//us.setValue('state', 'build');
						us.setValue('description', 'Automatically created by CICD Process'.concat(sc.getValue('short_description') ? '\n'.concat(sc.getValue('short_description')) : ''));
						gs.info('Automatically created by CICD Process'.concat(sc.getValue('short_description') ? '\n'.concat(sc.getValue('short_description')) : ''));
						var updateSetSysId = us.insert();
						gs.info("updat set sys id......"+updateSetSysId);
						// make new update-set active
						gus.set(updateSetSysId);
						gs.info('Step 5. New Master updateset sys id....'+ updateSetSysId);
						var updateSetRecord;
						gs.info('UpdateSet record length'+sysIds.length);
						for(var j=0; j<sysIds.length; j++){
							
							updateSetRecord = new GlideRecord('sys_update_set');
							updateSetRecord.addQuery('sys_id', sysIds[j]);
							updateSetRecord.query();
							if(updateSetRecord.next()) {
								updateSetRecord.setValue('parent',sysId);
								updateSetRecord.update('CICD Build');
								gs.info("Get the updated updateset status....."+ updateSetRecord.getValue('state'));
								
							}
							
						}
						/*
						as OOB sys_metadata_link records are not exported into an update set, this seems to be even the
						better way of doing it.
						e.g add a trigger via "add to application" ui action to a scoped app (this will create a sys_metadata_link record), export the app as update set (via ui action)
						and the sys_metadata_link is missing.
						
						sys_metadata_link flags are:
						
						'new install & upgrade'    > directory == 'update'
						'new install'              > directory == 'unload'
						'new install & demo data'  > directory == 'unload.demo'
						
						TODO: switch to exclude demo data
 						*/
						//         var meta = new GlideRecord('sys_scope');
						
						// 			gs.info('Step 6. Before Meta data query to check sys id');
						//         meta.addQuery('source','IN', sysIds);
						//         meta._query();
						var i=0;
						gs.info('Step 7. Before Query....');
						var appFiles = new GlideRecord('sys_update_set');
						appFiles.addQuery('sys_id','IN',sysIdStr);
						//            appFiles.addQuery('sys_id', 'IN', '42f6400cdb110010343f58b3ca961955,43668ae4db110010343f58b3ca9619dd');
						//appFiles.addQuery('state','current');
						//appFiles.addQuery('application',appId);
						appFiles.query();
						gs.info('Step 8. After query');
						while (appFiles._next()) {
							var sysUpdateXML = new GlideRecord('sys_update_xml');
							sysUpdateXML.addQuery('update_set',sysIds[i]);
							sysUpdateXML.query();
							gs.info('Step 9. Inside while loop 1'+i);
							while(sysUpdateXML.next()){
								gs.info('Inside appfiles');
								// make new update-set active -- in case multiple jobs run at the same time
								gus.set(updateSetSysId);
								// save the record to the update set
								usm.setValue('type',sysUpdateXML.getValue('type'));
								gs.info(usm.getValue('type')+'after setting type'+sysUpdateXML.getValue('type'));
								usm.saveRecord(sysUpdateXML);
							}
							i++;
						}
						//         while (meta._next()) {
							// 			i++;
							// 			gs.info('Step 8. Inside Meta data loop...'+i);
							//             var className = meta.getRecordClassName();
							
							//             if ('sys_ui_list' == className) {
								//                 var tmp = new GlideRecord(className);
								//                 if (tmp.get(meta.getValue('sys_id'))) {
									//                     var tableName = tmp.getValue('name');
									// 					gs.info('Table Name ----- PublishUpdate set-------'+tableName);
									//                     if (new TableUtils(tableName).getAbsoluteBase() != 'sys_metadata') // this works like OOB, but is wrong. correct would be: !new TableUtils(tableName).getHierarchy().some(function (name) { return (name == 'sys_metadata')})
										//                         continue;
										//                     if (!gs.nil(tmp.sys_user))
										//                         continue;
										//                 }
										//             }
										
										//             if (queryStore[className] === undefined)
										//                 queryStore[className] = [];
										
										//             queryStore[className].push(meta.getValue('sys_id'))
										//         }
										
										
										gs.info('[publishToUpdateSet] add all files to the update set');
										//         Object.keys(queryStore).forEach(function (tableName) {
											//             gs.info('[publishToUpdateSet] add ' + queryStore[tableName].length + ' files from ' + tableName);
											//             var appFiles = new GlideRecord(tableName);
											//             appFiles.addQuery('sys_id', 'IN', queryStore[tableName]);
											//             appFiles._query();
											//             while (appFiles._next()) {
												// 				gs.info('Inside appfiles');
												//                 // make new update-set active -- in case multiple jobs run at the same time
												//                 gus.set(updateSetSysId);
												//                 // save the record to the update set
												//                 usm.saveRecord(appFiles);
												//             }
												//         });
												
												gus.set(currentUS);
												us.setValue('state','complete');
												us.update('cicd build');
												return {
													updateSetSysId: updateSetSysId
												};
												
											},
											deployUIAction: function () {
												var self = this;
												var appIds = self.getParameter('appId');
												gs.info("appidddd=-----"+appIds);
												var currentSysApp = new GlideRecord('sys_app');
												currentSysApp.addQuery('sys_id',appIds);
												currentSysApp.query();
												while(currentSysApp.next()){
													gs.info("Inside while loop....."+currentSysApp.getValue('sys_id'));
												}
												gs.info("Test......"+currentSysApp.getValue('sys_id'));
												try {
													//             if (!self.settings.cicdEnabled)
													//                 return;
													
													//             if (!self.settings.cicdOnScopedAppsEnabled)
													//                 return;
													
													//             if (gs.nil(currentSysApp))
													//                 return;
													
													//             if (!gs.isInteractive())
													//                 return;
													gs.info('Before Rest api call');
													var cicdApi = new CiCdApi();
													var scopedUpdateSet = cicdApi.publishToUpdateSet(currentSysApp.getValue('sys_id'));
													gs.info('After Rest api call');
													gs.addInfoMessage('Application exported as <a href="/sys_update_set.do?sys_id=' + scopedUpdateSet.updateSetSysId + '">update set</a>. CICD Process started.')
													var cicd = new CiCdRun();
													gs.info('Before now function call=======');
													cicd.now({
														updateSet: scopedUpdateSet.updateSetSysId,
														application: {
															id: currentSysApp.getValue('sys_id'), // the id of the application
															name: currentSysApp.getValue('name')  // the name of the application
														},
														git: {
															repository: ((currentSysApp.getValue('scope') == 'global') ? currentSysApp.getValue('name') : currentSysApp.getValue('scope')).toLowerCase().replace(/\s+/g, '_') // assuming the git repo shares the name with the scoped app
														}
													});
													gs.info('Finall Step before return......'+scopedUpdateSet);
													return scopedUpdateSet;
												} catch (e) {
													
													if (e.code == "ALREADY_RUNNING") {
														return gs.addErrorMessage('There is already a <a href="' + e.link + '">CICD run</a> in progress for this application.');
													}
													
													gs.error(e);
												}
											},
											type: 'CiCDUpdateStatus'
										});

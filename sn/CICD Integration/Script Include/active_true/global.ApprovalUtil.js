/* 
 * Application : CICD Integration
 * ClassName   : sys_script_include
 * Created On  : 2015-02-06 17:37:19
 * Created By  : 162107
 * Updated On  : 2015-02-06 17:38:14
 * Updated By  : 162107
 * URL         : /sys_script_include.do?sys_id=20f5810a2b0abd00764f3e2be8da1551
 */
var ApprovalUtil = Class.create();
ApprovalUtil.prototype = {
	/**
 	* Creates an ApprovalUtil object
 	* @constructor
	 * @param {GlideRecord} a glide record of what the approval is for
 	*/
	initialize: function(approvalFor) {
		this.approvalFor = approvalFor;
		this.categoryItem = approvalFor.cat_item.name;
		this.result = '';
		this.resultObj = [];
		this.variablesNeeded = [];
		this.logger(approvalFor + "/" + approvalFor.short_description + " is going through ApprovalUtil");
	},
	/**
 	* Processes the custom fields needed for an approval email
 	* @return {String} a result list, containing questions and their values
 	*/
	getCustomFields : function() {
		//Insert any conditions to change the call to this.getVariables()
		this.variablesNeeded = this.getVariables('');
		this.logger(this.variablesNeeded.toString() + " are the variables to process");
		var sc = new GlideRecord('sc_item_option_mtom');
		sc.addQuery('request_item', this.approvalFor);
		sc.query();
		while(sc.next()){
			for (var i = 0; i < this.variablesNeeded.length; i++){
				var valueVar = '', checkBoxFlag = false;
				if (sc.sc_item_option.item_option_new.name == this.variablesNeeded[i]){
					if (sc.sc_item_option.item_option_new.reference == 'sys_user'){
						var user = new GlideRecord('sys_user');
						if (user.get(sc.sc_item_option.value)){
							valueVar = user.name;
						}
					} else if (sc.sc_item_option.item_option_new.reference == 'cmn_location'){
						var location = new GlideRecord('cmn_location');
						if (location.get(sc.sc_item_option.value)){
							valueVar = location.name;
						}
					} else if (sc.sc_item_option.item_option_new.reference == 'cmn_department'){
						var department = new GlideRecord('cmn_department');
						if (department.get(sc.sc_item_option.value)) {
							valueVar = department.name;
						}
					} else if (sc.sc_item_option.item_option_new.reference == 'core_company') {
						var company = new GlideRecord('core_company');
						if (company.get(sc.sc_item_option.value)){
							valueVar = company.name;
						}
					} else if (sc.sc_item_option.item_option_new.lookup_table == 'my_look_up_table'){
						var roles = new GlideRecord('my_look_up_table');
						if (roles.get(sc.sc_item_option.value)){
							valueVar = roles.my_look_up_table_value;
						}
					} else if (sc.sc_item_option.item_option_new.type == 5) {
						valueVar = this.getSelectValueBasedOnValue(sc.sc_item_option.item_option_new.name, sc.sc_item_option.value);
					} else if (sc.sc_item_option.item_option_new.type == 7) { 
						if (sc.sc_item_option.value == 'true'){
							valueVar = "Selected";
						} else {
							valueVar = "Not Selected";
						}
					} else {
						valueVar = sc.sc_item_option.value;
					}			
					if (this.isFinancial(this.variablesNeeded[i])){
						valueVar = this.formatMoneyValue(valueVar);
					}
					this.resultObj.push({'name': this.variablesNeeded[i], 'text': sc.sc_item_option.item_option_new.question_text, 'value': valueVar});
					this.result += sc.sc_item_option.item_option_new.question_text + " : " + valueVar + "\n";
				}
			}
		}
		this.result = this.reorderResult();
		if (this.result.length > 0){			
			this.result = "\nRequested By: " + this.approvalFor.request.requested_for.name + '\n\n'.concat(this.result);
			return this.result;	
		} else {
			return '';
		}		
	},
	/**
 	* Reorders the results from the query into the correct field order so it can be printed neatly in an email
 	* @return {String} a string that contains proper output
 	*/
	reorderResult: function(){
		var returnString = '';
		for (var i = 0; i < this.variablesNeeded.length; i++){
			for (var j = 0; j < this.resultObj.length; j++){
				if (this.resultObj[j].name == this.variablesNeeded[i]){
					returnString += this.resultObj[j].text + ": " + this.resultObj[j].value + "\n";
				}
			}
		}
		return returnString;
	},
	/**
	 * Finds the value that appears on the form for a Select Box
	 * @param {String} name - the name of the question/select box variable
	 * @param {String} value - the value of the question choice
	 * @return {String} the text value of the question choice
	 */
	getSelectValueBasedOnValue: function(name, value){
		var questionChoice = new GlideRecord('question_choice');
		questionChoice.addQuery('question.name', name);
		questionChoice.addQuery('value', value);
		questionChoice.query();
		if (questionChoice.next()){			
			return questionChoice.text;
		}
	},
	/**
 	* gets the variable list associated with the catalog item
 	* @param {String} argument - includes any extra text to add to the system property
 	* @return {Array} an array containing variables (questions) to look for
 	*/
	getVariables: function(argument) {
		var regex = /\W/g;
		var propertyName = this.categoryItem.replace(regex, '').toLowerCase();
		this.logger(propertyName + " is propertyName");
		if (argument != ''){
			var variableList = gs.getProperty('approvalfields.' + propertyName + argument);
		} else {
			var variableList = gs.getProperty('approvalfields.' + propertyName);
		}
		try {
			return variableList.split(',');
		} catch (e) {
			return '';
		}
	},
	/**
	 * Checks to see if the variable is a financial email, so we can format it properly
	 * @param {String} variable - a variable name to check for
	 * @return {String} a string formatted with $ and the proper number of decimal places
	 */
	isFinancial: function(variable){
		if (variable == 'original_invoice' ||
			variable == 'revised_invoice' ||
			variable == 'financial_impact') {
			return true;
		}
		return false;
	},
	/**
	 * Formats a string into a money value; does not check to see if it's just numbers
	 * @param {String} value - the value to convert to money
	 * @return {String} a string formatted with a dollar sign and at least 2 decimal places
 	*/
	formatMoneyValue: function(value){
		var valueArray = value.toString().split('.');
		if (valueArray[0].indexOf('-') > -1) {
			var returnVal = '-$' + valueArray[0].replace('-', '');
		} else {
			var returnVal = '$' + valueArray[0];
		}
		if (valueArray.length > 1) {
			if (valueArray[1].length == 1){
				valueArray[1] = valueArray[1].concat('0');
			} else if (valueArray[1].length > 2) {
				valueArray[1] = valueArray[1].substring(0,2);
			}
			returnVal += '.' + valueArray[1];
		} else if (valueArray.length == 1) {
			returnVal += '.00';
		}
		return returnVal;
	},
	/**
 	* Logger function that does not work in prod
 	*/
	logger: function(text){
		if (gs.getProperty('instance_name') != 'production'){
			gs.log(text);
		}
	},
	type: "ApprovalUtil"
};

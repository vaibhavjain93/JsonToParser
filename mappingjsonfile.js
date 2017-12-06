//to convert keys to camel case use lodash.camelCase
const lodash = require('lodash');
const fs = require('fs');
const parserName = "parser";
const parserFile = parserName+".txt";
const keysFile = "keys.txt";
const jsFile = "js.txt";

var keySet = new Set();
var jsonObject = {};
var indent = '';

//put jsonObject for which parsing is to be done in this variable
fs.readFile(jsFile,'utf-8',function(error,data) {
	jsonObject = JSON.parse(data);
	//console.log(jsonObject);
	console.log("file read");
	mainRecursive(jsonObject,'dataObject');
	logger.end();
	console.log('parser file saved!');
	writeKeysToFile(keySet);
});



const logger = fs.createWriteStream(parserFile);
const keyLogger = fs.createWriteStream(keysFile);

var types = ["JSONObject","JSONArray","String","boolean","int","double"];

function getcodeforjsonobject(jsonObjectName,parentJsonObjectName,keyNameInCaps){
	writeDataToParser('JSONObject '+jsonObjectName+' = '+parentJsonObjectName+'.optJSONObject(Keys.'+keyNameInCaps+');\n');
	writeDataToParser('if('+jsonObjectName+' != null) {\n');
	indent+='  '; 
}


function getcodeforjsonarray(jsonArrayName, parentJsonObjectName,keyNameInCaps){
	writeDataToParser('JSONArray '+jsonArrayName+' = '+parentJsonObjectName+'.optJSONObject(Keys.'+keyNameInCaps+');\n');
	writeDataToParser('if('+jsonArrayName+' != null && '+jsonArrayName+'.length() > 0) {\n');
	indent+='  '; 
	writeDataToParser('for (int i = 0; i < '+jsonArrayName+'.length(); i++) {\n');
	indent+='  '; 

}

function getcodeforjsonprimitive(primitiveType, parentJsonObjectName,keyNameInCaps,keynameinCamelCase){
	var primitiveTypeCapitaliseCase = lodash.capitalize(primitiveType);
	writeDataToParser(primitiveType+' '+keynameinCamelCase+' = '+parentJsonObjectName+'.opt'+primitiveTypeCapitaliseCase+'(Keys.'+keyNameInCaps+');	\n');
}

function getcodeforprimitives(jsonElementValue){
	var type = typeof jsonElementValue;
	if(type === "number"){
		if(isInt(jsonElementValue)){
			type = "int";
		}
		else if(isFloat(jsonElementValue)){
			type = "double";
		}	
	}
	return type;
}

function addKeyToSet(keyName) {
	keySet.add(keyName);
	    //keylogger.writeDataToParserToFile('public static final String '+keyName.toUpperCase()+' = "'+keyName+'";\n');
}

function writeKeysToFile(keySet) {
	keySet.forEach(logSetElements);
	keyLogger.end();
	console.log('keys file saved!');
}

function logSetElements(keyName) {
    keyLogger.write('public static final String '+keyName.toUpperCase()+' = "'+keyName+'";\n');

}

function isInt(n){
    return Number(n) === n && n % 1 === 0;
}

function isFloat(n){
    return Number(n) === n && n % 1 !== 0;
}

function getjsonElementValueType(jsonElementValue) {

    var arrayConstructor = [].constructor;
    var objectConstructor = {}.constructor;
    var stringConstructor = "string".constructor;

    if (jsonElementValue === null) {
        return "null";
    }
    else if (jsonElementValue === undefined) {
        return "undefined";
    }
    else if (jsonElementValue.constructor === stringConstructor) {
        return "String";
    }
    else if (jsonElementValue.constructor === arrayConstructor) {
        return "JSONArray";
    }
    else if (jsonElementValue.constructor === objectConstructor) {
        return "JSONObject";
    }
    else {
        return getcodeforprimitives(jsonElementValue);
    }
}

function writeDataToParser(data) {
	logger.write(indent+data);
}


function mainRecursive(jsonObject,parentJsonElementName){
	
	var keys = Object.keys(jsonObject);
	// console.log(keys);
	for(var i=0;i<keys.length;i++){
		
		var keyName = keys[i];
		addKeyToSet(keyName);
		var keyNameInCaps = keyName.toUpperCase();
		var keynameinCamelCase = lodash.camelCase(keyName);
		var jsonelementType = getjsonElementValueType(jsonObject[keyName]);
		
		switch (types.indexOf(jsonelementType)){
 
			case 0:
			//JSONObject
			var jsonObjectName = keynameinCamelCase+"Object";
			getcodeforjsonobject(jsonObjectName,parentJsonElementName,keyNameInCaps);
			mainRecursive(jsonObject[keyName],jsonObjectName);
			indent = indent.substr(2);
			writeDataToParser('}\n');
			break;

			case 1:
			//JSONArray
			var jsonArrayName = keynameinCamelCase+"Array";
			getcodeforjsonarray(jsonArrayName, parentJsonElementName,keyNameInCaps);
			mainRecursive(jsonObject[keyName][0],jsonArrayName+"[i]");
			indent = indent.substr(2);
			writeDataToParser('}\n');
			indent = indent.substr(2);
			writeDataToParser('}\n');
			
			break;

			case 2:
			//String
			getcodeforjsonprimitive(jsonelementType, parentJsonElementName,keyNameInCaps,keynameinCamelCase);
			break;

			case 3:
			//boolean
			getcodeforjsonprimitive(jsonelementType, parentJsonElementName,keyNameInCaps,keynameinCamelCase);
			break;

			case 4:
			//int
			getcodeforjsonprimitive(jsonelementType, parentJsonElementName,keyNameInCaps,keynameinCamelCase);
			break;

			case 5:
			//double
			getcodeforjsonprimitive(jsonelementType, parentJsonElementName,keyNameInCaps,keynameinCamelCase);
			break;

	  	}
	}
}




//json object -> JSONObject jsonObjectName = parentJsonObjectName.optJSONObject(Keys.keyNameInCaps);
//		if(jsonObjectName != null){
//		  }to be written in the end of the block

//json array -> 
//	JSONArray jsonArrayName = parentJsonObjectName.optJSONArray(Keys.keyNameInCaps);
//	if (jsonArrayName != null && jsonArrayName.length() > 0) {
//	  }to be written in the end of the block
		

//string -> String keynameinCamelCase = parentJsonObjectName.opt+primitiveTypeCamelCase(Keys.keyNameInCaps);

//boolean -> boolean keynameinCamelCase = parentJsonObjectName.opt+primitiveTypeCamelCase(Keys.keyNameInCaps);

//double -> double keynameinCamelCase = parentJsonObjectName.opt+primitiveTypeCamelCase(Keys.keyNameInCaps);

//int -> int keynameinCamelCase = parentJsonObjectName.opt+primitiveTypeCamelCase(Keys.keyNameInCaps);

//primitive -> primitiveType keynameinCamelCase = parentJsonObjectName.opt+primitiveTypeCamelCase(Keys.keyNameInCaps);




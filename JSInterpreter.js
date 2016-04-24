/**
JSInterpreter takes youtube's html5 player code as an input.
It parses it to find the signature function name, then extracts the function body, function arguments,
and any external objects in relies on. Then it construct new JavaScript function from this information,
which we assign to decryptSignature field and can use it to decrypt the "s" parameter to sign the videos.
*/
function JSInterpreter(code){
	//decryptSignature is the function that will be extracted from the html5 player
	this.decryptSignature = null;

	var extractDecryptionFunction = function(self) {
		//firstly parse code to find signature function name
		var functionName = new RegExp(/\.sig\|\|([A-Za-z0-9_]+)\(/gm).exec(code)[1];

		if(functionName == undefined){
			throw new Error("Couldn't find signature function");
		}

		//now find complete signature function
		var signatureFunction = new RegExp("(?:function\\s+{0}|[{;,]{0}\\s*=\\s*function|var\\s+{0}\\s*=\\s*function)\\s*\\(([A-Za-z0-9_,]*)\\)\\{([^\\}]*)\\}".format(functionName), "gm").exec(code);
		var signatureFunctionArgs = {};
		var signatureFunctionCode = signatureFunction[2];
		var signatureFunctionStatements = signatureFunctionCode.split(";");

		var args = signatureFunction[1].split(",");
		for(var arg in args) {
			signatureFunctionArgs[args[arg]] = true;
		}

		//now find all variables used by signature function
		for(var statement in signatureFunctionStatements) {
			var variable = new RegExp(/([A-Za-z0-9]+)\./gm).exec(signatureFunctionStatements[statement]);

			//if variable is not local
			if(!signatureFunctionArgs[variable[1]]){
				//then find it in outer scope
				signatureFunctionArgs[variable[1]] = true;
				signatureFunctionCode = extractObject(variable[1]) + ";" + signatureFunctionCode;
			}
		}

		self.decryptSignature = new Function(signatureFunction[1].split(","), signatureFunctionCode);		
	};

	var extractObject = function(objectName) {
		//find the index of opening bracket of the object
		var openingBracketIndex = code.search(new RegExp("var\\s*{0}\\s*=\\s*\\{".format(objectName), "gm"));
		if (openingBracketIndex < 0) {
			return null;
		}

		var nOpenBrackets = 0;

		var openingBracket = code.indexOf("{", openingBracketIndex);
		var closingBracket = openingBracketIndex - 1;

		do {
			//find next closing bracket
			closingBracket = code.indexOf("}", closingBracket + 1);
			nOpenBrackets--;

			//found crossing between opening and closing brackets
			//all brackets are closed now
			if (closingBracket < openingBracket) {
				break;
			}

			//find an all opening brackets, before the closing bracket
			while (openingBracket < closingBracket) {
				openingBracket = code.indexOf("{", openingBracket + 1);
				nOpenBrackets++;
			}
		} while (nOpenBrackets > 0);

		return code.substring(openingBracketIndex, closingBracket+1);
	};

	if (!String.prototype.format) {
	  String.prototype.format = function() {
	    var args = arguments;
	    return this.replace(/\{(\d+)\}/g, function(match, number) { 
	      return typeof args[number] != 'undefined'
	        ? args[number]
	        : match
	      ;
	    });
	  };
	}

	extractDecryptionFunction(this);
};

exports.JSInterpreter = JSInterpreter;
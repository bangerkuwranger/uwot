'use-strict';

class UwotAbstractRuntime {

	constructor(ast, user) {
	
		/***	constructor docs	***/
		
		// concrete class should: 
		// validate ast and its top level structure before parsing; throw error if invalid/undefined
		// assign ast & user as object props
		// perform any pre-parser config or user properties and set as needed
		// initialize required object properties:
			// this.exes = null; (should become a map when this.buildCommands is run)
			
		// begin tree traversal to create executeMap with method buildCommands
		
		
		
		/***	end constructor docs	***/
		
		/***	property docs	***/
		
		
		
		/***	end property docs	***/
		
		/***	method docs		***/
		
		//(required) buildCommands() {
			// assign empty Map to this.exes
			// begin recursive traversal of AST, assigning a recursive Map of all executable nodes
			// returns the exes prop in case we need to use in closure somewhere rather than deferring execution
		//}
		
		//(required) executeCommands() {
	
			// deferred execution starts here, traversing this.exes Map
			// assign results object to results property and return its value
	
		//}
		
		//parseCommandNode(astCmd, output, input) {

			// top level logic for sorting each command node by type, then running appropriate parsing method with proper args
			// note, if implementing redirects a they should be passed down here in order to route execution IO in subparser
			// throw error if commandNode is invalid or type is not one of the supported types
			// default redirects to null if unset
			// choose valid type, assign appropriate args, run matching subparser

		//}
		
		//parse[x](args) {
		
			// subparser methods to be called for any required AST node types
			// if creating executables for this.exes, should verify that they are available in the listener's cmdSet
			// if implementing redirects, should accept them as args
		
		//}
		
		//outputLine(output, args) {
		
			// recommended to have a convenience method for formatting output
		
		//}
		
		//executeMap(args) {
		
			// recommended to have a discrete method for performing deferred execution
			// would be called by executeCommands after any preprocessing
		
		//}
		
		/***	end method docs		***/
		
		/***	begin abstraction check 	***/
		
		// (don't include this logic in concrete class constructor)
		
		if (this.constructor === UwotAbstractRuntime) {
		
            throw new TypeError('Abstract class "UwotAbstractRuntime" cannot be instantiated directly'); 
       
        }
        if ('function' !== typeof this.buildCommands) {
		
			throw new TypeError('class extending "UwotAbstractRuntime" must implement method buildCommands'); 
		
		}
		if ('function' !== typeof this.executeCommands) {
		
			throw new TypeError('class extending "UwotAbstractRuntime" must implement method executeCommands'); 
		
		}
		if ('function' !== typeof this.parseCommandNode) {
		
			this.parseCommandNode = function(args) {
			
				return new TypeError('class extending "UwotAbstractRuntime" has not implemented method parseCommandNode'); 
			
			};
		
		}
		if ('function' !== typeof this.outputLine) {
		
			this.outputLine = function(args) {
			
				return new TypeError('class extending "UwotAbstractRuntime" has not implemented method outputLine'); 
			
			};
		
		}
		if ('function' !== typeof this.executeMap) {
		
			this.executeMap = function(args) {
			
				return new TypeError('class extending "UwotAbstractRuntime" has not implemented method executeMap'); 
			
			};
		
		}
		
        /***	end abstraction check	***/
	
	}
	
	addAppInstance(app) {
	
		this.app = app;
		return this;
	
	}
	
	addInstanceSessionId(isid) {
	
		this.isid = isid;
		return this;
	
	}

}

module.exports = UwotAbstractRuntime;

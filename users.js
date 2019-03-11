'use strict';
const fs = require('fs');
const path = require('path');
var Datastore = require('nedb-core');
var bcrypt = require('bcryptjs');
var sanitize = require('./helpers/valueConversion');
var rules = require('password-rules');

/**
 * Number	_id
 * String	fName
 * String	lName
 * String	uName
 * Date		createdAt
 * Date		updatedAt
 * String	password
 * String	salt
 * Boolean 	sudoer
 */
 
class User {

	constructor(
		_id,
		fName,
		lName,
		uName,
		createdAt,
		updatedAt,
		password,
		salt,
		sudoer
	) {
	
		var cleanId = sanitize.cleanString(_id, null);
		if (null !== cleanId) {
		
			this._id = cleanId;
		
		}
		this.fName = sanitize.cleanString(fName);
		this.lName = sanitize.cleanString(lName);
		this.uName = sanitize.cleanString(uName);
		this.password = sanitize.cleanString(password);
		this.sudoer = sanitize.cleanBool(sudoer);
		this.salt = sanitize.cleanString(salt);
		this.createdAt = sanitize.cleanDate(createdAt);
		this.updatedAt = sanitize.cleanDate(updatedAt);
	
	}
	
	saltPass(password) {
	
		if ('string' !== typeof password) {
		
			throw new TypeError('invalid password value passed to saltPass.');
		
		}
		if ('undefined' === typeof this.salt || null === this.salt || !this.salt) {
		
			this.salt = bcrypt.genSaltSync(16);
		
		}
		var secretHash = bcrypt.hashSync(password, this.salt);
		return secretHash;
	
	}
	
	verifyPassword(password) {
	
		if ('string' !== typeof password) {
		
			throw new TypeError('invalid password value passed to verifyPassword.');
		
		}
		if ('undefined' === typeof this.salt || null === this.salt || !this.salt) {
		
			return false;
		
		}
		else {
		
			return bcrypt.compareSync(password, this.password);
		
		}
	
	}
	
	maySudo() {
	
		if ('boolean' !== typeof this.sudoer || !this.sudoer) {
		
			return false;
		
		}
		else {
		
			return this.sudoer;
		
		}
	
	}
	
	fullName(format) {
	
		format = 'string' !== typeof format ? 'l, f' : format;
		var fullName = format
		.replace(/f/g, this.fName)
		.replace(/l/g, this.lName);
		return fullName;
	
	}

}

// TBD
// implement allowRootUser function

module.exports = class UwotUsers {

	constructor() {
	
		this.db = new Datastore({ filename: 'var/nedb/users.db', autoload: true, timestampData: true });
		this.db.ensureIndex({
			fieldName: 'uName',
			unique: true,
		});
		// TBD
		// check if create user dir is set in config
		// if so, verify each user has a dir
		// if not, create dir and set perms for user
	
	}
	
	getGuest(callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to getGuest.');
		
		}
		else {
		
			try {
			
				var guest = new User(
					null,
					'guest',
					'user',
					'guest',
					new Date(),
					new Date(),
					null,
					null,
					false
				);
				delete guest.password;
				delete guest.salt;
				delete guest.saltPass;
				delete guest.verifyPassword;
				guest._id = 'GUEST';
				return callback(false, guest);
			
			}
			catch(e) {
			
				return callback(e, null);
			
			}
		
		}
	
	}
	
	findById(uId, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to findById.');
		
		}
		else if ('string' !== typeof uId || '' === uId) {
		
			return callback(new TypeError('invalid id passed to findById.'), null);
		
		}
		else {
		
			self.fbiCallback = callback;
			this.db.find({_id: uId}, {password: 0, salt: 0}, function(error, data) {
			
				if (error) {
				
					return self.fbiCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' !== typeof data[0]) {
				
					return self.fbiCallback(false, false);
				
				}
				else {
				
					var foundRecord = new User(
						data[0]._id,
						data[0].fName,
						data[0].lName,
						data[0].uName,
						data[0].createdAt,
						data[0].updatedAt,
						null,
						null,
						data[0].sudoer
					);
					return self.fbiCallback(false, foundRecord);
				
				}
			
			});
		
		}
	
	}
	
	findByName(uName, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to findByName.');
		
		}
		else if ('string' !== typeof uName || '' === uName) {
		
			return callback(new TypeError('invalid user name passed to findByName.'), null);
		
		}
		else {
		
			self.fbnCallback = callback;
			this.db.find({uName: sanitize.cleanString(uName)}, {password: 0, salt: 0}, function(error, data) {
			
				if (error) {
				
					return self.fbnCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' !== typeof data[0]) {
				
					return self.fbnCallback(false, false);
				
				}
				else {
				
					var foundRecord = new User(
						data[0]._id,
						data[0].fName,
						data[0].lName,
						data[0].uName,
						data[0].createdAt,
						data[0].updatedAt,
						null,
						null,
						data[0].sudoer
					);
					return self.fbnCallback(false, foundRecord);
				
				}
			
			});
		
		}
	
	}
	
	// TBD
	// check if create user dir is set in config
	// create user dir if not exists
	// rename old and create new if dir already exists
	createNew(uObj, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to createNew.');
		
		}
		else if ('object' !== typeof uObj || null === uObj || 'string' !== typeof uObj.uName || '' === uObj.uName || 'string' !== typeof uObj.password || '' === uObj.password) {
		
			return callback(new TypeError('invalid user object passed to createNew.'), null);
		
		}
		else {
		
			self.cnCallback = callback;
			var pwInvalid = rules(uObj.password, {maximumLength: 255});
			this.isUnique(sanitize.cleanString(uObj.uName), function(error, isUnique) {
			
				if (error) {
		
					return self.cnCallback(error, isUnique);
		
				}
				else if (!isUnique) {
			
					var message = 'User "' + uObj.uName + '" already exists.';
					return self.cnCallback(new Error(message), false);
			
				}
				else if (pwInvalid) {
				
					return self.cnCallback(new Error(pwInvalid.sentence), false);
				
				}
				else {
				
					var newUser = new User(
						null,
						uObj.fName,
						uObj.lName,
						uObj.uName,
						uObj.createdAt,
						uObj.updatedAt,
						uObj.password,
						null,
						uObj.sudoer
					
					);
					newUser.password = newUser.saltPass(newUser.password);
					delete newUser._id;
					self.db.insert(newUser, function(error, data) {
			
						if (error) {
				
							return self.cnCallback(error, null);
				
						}
						else if ('object' !== typeof data || null === data || 'string' !== typeof data._id) {
				
							return self.cnCallback(false, false);
				
						}
						else {
				
							var savedUser = new User(
								data._id,
								data.fName,
								data.lName,
								data.uName,
								data.createdAt,
								data.updatedAt,
								data.password,
								data.salt,
								data.sudoer
					
							);
							return self.cnCallback(false, savedUser);
				
						}
			
					});
				
				}
			
			});
		
		}
	
	}
	
	remove(uId, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to remove.');
		
		}
		else if ('string' !== typeof uId || '' === uId) {
		
			return callback(new TypeError('invalid user id passed to remove.'), null);
		
		}
		else {
		
			self.rCallback = callback;
			this.db.remove({_id: uId}, {}, function(error, data) {
			
				if (error) {
				
					return self.rCallback(error, null);
				
				}
				else if (data === 0) {
				
					return self.rCallback(false, false);
				
				}
				else {
				
					return self.rCallback(false, true);
				
				}
			
			});
		
		}
	
	}
	
	changePw(uId, oldPw, newPw, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to changePw.');
		
		}
		else if ('string' !== typeof uId || '' === uId || 'string' !== typeof oldPw || 'string' !== typeof newPw) {
		
			return callback(new TypeError('invalid args passed to changePw.'), null);
		
		}
		else {
		
			self.cpCallback = callback;
			var pwInvalid = rules(newPw, {maximumLength: 255});
			this.validate(uId, oldPw, function(error, isValid) {
			
				if (error) {
				
					return self.cpCallback(error, null);
				
				}
				else if (!isValid) {
				
					return self.cpCallback(new Error('Cannot change user password; old password invalid.'), null);
				
				}
				else if (pwInvalid) {
				
					return self.cpCallback(new Error('Invalid value for new password: ' + pwInvalid.sentence), null);
				
				}
				else if (oldPw === newPw) {
					
					return self.cpCallback(new Error('Invalid value for new password: Password must be unique.'), null);
				
				}
				else {
				
					var uObj = new User(
						uId,
						null,
						null,
						null,
						null,
						null,
						newPw,
						null,
						false
					);
					uObj.password = uObj.saltPass(uObj.password);
					self.db.update({_id: uId}, {$set: {password: uObj.password, salt: uObj.salt}}, function(error, data) {
			
						if (error) {
				
							return self.cpCallback(error, null);
				
						}
						else if (data === 0) {
				
							return self.cpCallback(false, false);
				
						}
						else {
				
							return self.cpCallback(false, true);
				
						}
			
					});
				
				}
			
			});
		
		}
	
	}
	
	changeName(uId, fName, lName, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to changeName.');
		
		}
		else if ('string' !== typeof uId || '' === uId || 'string' !== typeof fName || 'string' !== typeof lName) {
		
			return callback(new TypeError('invalid args passed to changeName.'), null);
		
		}
		else {
		
			self.cnameCallback = callback;
			this.db.update({_id: sanitize.cleanString(uId, null)}, {$set: {fName: sanitize.cleanString(fName), lName: sanitize.cleanString(lName)}}, {}, function(error, numReplaced){
			
				if (error) {
				
					return self.cnameCallback(error, null);
				
				}
				else if ('number' !== typeof numReplaced || numReplaced < 1) {
				
					return self.cnameCallback(false, false);
				
				}
				else {
				
					return self.cnameCallback(false, true);
				
				}
			
			});
		
		}
	
	}
	
	changeSudo(uId, maySudo, callback) {
	
		var self = this;
		if ('string' === typeof maySudo) {
		
			if ('true' === maySudo.toLowerCase()) {
			
				maySudo = true;
			
			}
			else if ('false' === maySudo.toLowerCase()) {
			
				maySudo = false;
			
			}
		
		}
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to changeSudo.');
		
		}
		else if ('string' !== typeof uId || '' === uId || 'boolean' !== typeof maySudo) {
		
			return callback(new TypeError('invalid args passed to changeSudo.'), null);
		
		}
		else {
		
			self.csCallback = callback;
			this.db.update({_id: sanitize.cleanString(uId, null)}, {$set: {sudoer: maySudo}}, {}, function(error, numReplaced){
			
				if (error) {
				
					return self.csCallback(error, null);
				
				}
				else if ('number' !== typeof numReplaced || numReplaced < 1) {
				
					return self.csCallback(false, false);
				
				}
				else {
				
					return self.csCallback(false, true);
				
				}
			
			});
		
		}
	
	}
	
	validate(uId, pw, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to validate.');
		
		}
		else if ('string' !== typeof uId || '' === uId || 'string' !== typeof pw || '' === pw) {
		
			return callback(new TypeError('invalid args passed to validate.'), null);
		
		}
		else {
		
			self.vCallback = callback;
			this.db.find({_id: uId}, {}, function(error, data) {
			
				if (error) {
				
					return self.vCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' !== typeof data[0]) {
				
					return self.vCallback(false, false);
				
				}
				else {
				
					var checkUser = new User(
						data[0]._id,
						data[0].fName,
						data[0].lName,
						data[0].uName,
						data[0].createdAt,
						data[0].updatedAt,
						data[0].password,
						data[0].salt,
						data[0].sudoer
					);
					return self.vCallback(false, checkUser.verifyPassword(pw));
				
				}
			
			});
		
		}
	
	}
	
	listUsers(callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to listUsers.');
		
		}
		else {
		
			this.db.find({})
			.projection({password: 0, salt: 0})
			.sort({uName: 1})
			.exec(function(error, results) {
		
				callback(error, results);
		
			});
		
		}
	
	}
	
	isUnique(username, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to isUnique.');
		
		}
		else if ('string' !== typeof username || '' === username) {
		
			return callback(new TypeError('invalid username passed to isUnique.'), null);
		
		}
		else if ('guest' === username) {
		
			return callback(false, false);
		
		}
		else {
		
			self.iuCallback = callback;
			var iuQuery = {uName: username};
			this.db.count(iuQuery, function(error, result) {
		
				if (error) {
				
					return self.iuCallback(error, false);
			
				}
				if ('undefined' === typeof result || result < 1) {
			
					return self.iuCallback(false, true);
			
				}
				return self.iuCallback(false, false);
		
			});
		
		}
	
	}
	
	createDir(userIds, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to createDir');
		
		}
		else if ('object' !== typeof userIds || !Array.isArray(userIds) || userIds.length < 1) {
		
			return callback(new TypeError('invalid userIds passed to createDir'), null);
		
		}
		else if (!global.Uwot.Config.getVal('users', 'createHome')) {
		
			return callback(false, false);
		
		}
		else {
		
			self.cdCallback = callback;
			this.db.find({})
			.projection({password: 0, salt: 0})
			.exec(function(error, allUsers) {
			
				if (error) {
				
					return self.cdCallback(error, null);
				
				}
				else {
				
					var vaildUsers = allUsers.map((u) => { u._id });
					var userDirPath = global.Uwot.Config.getVal('server', 'userDir');
					fs.readdir(userDirPath, function(err, userFiles) {
					
						if (err) {
				
							return self.cdCallback(err, null);
				
						}
						else {
						
							var userDirs = [];
							for (let i = 0; i < userIds.length; i++) {
				
								if ('string' === typeof userIds[i] && -1 !== validUsers.indexOf(userIds[i])) {
					
									var thisUserName = allUsers[validUsers.indexOf(userIds[i])].uName;
									var thisFilePath = path.join(userDirPath, thisUserName);
									if (-1 !== userFiles.indexOf(thisUserName)) {
									
										try {
										
											var thisFileStats = fs.statSync(thisFilePath);
											if (!thisFileStats.isDirectory()) {
											
												fs.unlinkSync(thisFilePath);
												fs.mkdirSync(thisFilePath);
											
											}
											userDirs.push(thisUserName);
										
										}
										catch(e) {
										
											try {
											
												fs.mkdirSync(thisFilePath);
												userDirs.push(thisUserName);
											
											}
											catch(e) {
											
												return self.cdCallback(e, userDirs);
											
											}
										
										}
									
									}
					
								}
								if ((i + 1) >= userIds.length) {
								
									return self.cdCallback(false, userDirs);
								
								}
				
							}
						
						}
					
					});
				
				}
		
			});
		
		}
	
	}

};

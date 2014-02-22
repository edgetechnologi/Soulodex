/**
 * Copyright 2013 Kinvey, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/* global $: true, Kinvey: true */
(function() {
  'use strict';

  // Setup.
  // ------

//var phpCall = '<??>
  // Initialize Kinvey.
  var promise = Kinvey.init({
    appKey    : 'kid_PTM0tk_9T9',
    appSecret : '75901481cb2a42f5a9f6f954db29e229',
    sync      : {
      enable : true,
      online : navigator.onLine
    }
  });
  promise.then(function() {
      $.mobile.initializePage();// Render page.
  });

  // On/offline hooks.
  $(window).on({
    offline : Kinvey.Sync.offline,
    online  : function() {
      // Some browsers fire the online event before the connection is available
      // again, so set a timeout here.
      setTimeout(function() {
        Kinvey.Sync.online();
      }, 10000);
    }
  });
  
  // Globals.
  var doc = $(document);
  var geoCoderKey = 'd9cf718cbf4d49b8a3c10f21bb2cbfbc';
  var channelFallBack = '<option value="African-American Owned Businesses">African-American Owned Businesses</option><option value="Asian Owned Businesses">Asian Owned Businesses</option><option value="Automotive">Automotive</option><option value="Barbers">Barbers</option><option value="Beauty Shops">Beauty Shops</option><option value="Business Opportunities">Business Opportunities</option><option value="Churches">Churches</option><option value="Community Resources">Community Resources</option><option value="Educational Resources">Educational Resources</option><option value="Employment Opportunities">Employment Opportunities</option><option value="Fraternities">Fraternities</option><option value="Government Resources">Government Resources</option><option value="Health">Health</option><option value="Hispanic Owned Businesses">Hispanic Owned Businesses</option><option value="Legal">Legal</option><option value="MBE Certified Businesses">MBE Certified Businesses</option><option value="Masonic">Masonic</option><option value="Mass SOMWBA">Mass SOMWBA</option><option value="Meetings">Meetings</option><option value="Minority 8a Certified">Minority 8a Certified</option><option value="Networking Events">Networking Events</option><option value="Non-Profit">Non-Profit</option><option value="Pensacola African-American Enterprise Directory">Pensacola African-American Enterprise Directory</option><option value="Real Estate">Real Estate</option><option value="Religious Events">Religious Events</option><option value="Restaurants">Restaurants</option><option value="Small Business Resources">Small Business Resources</option><option value="Social Events">Social Events</option><option value="Sororities">Sororities</option><option value="Sports Events">Sports Events</option><option value="Travel">Travel</option><option value="Woman Owned Businesses">Woman Owned Businesses</option><option value="it works">it works</option>';
    
  var home = $('#home');

  doc.on('click', '.logout', function() {
    if( Kinvey.getActiveUser()!== null ) {
      var button = $(this).addClass('ui-disabled');

      // Logout the active user.
      Kinvey.User.logout().then(function() {
        $.mobile.changePage(login);// Redirect.
      }, function(error) {
        doc.trigger('error', error);
      }).then(function() {// Restore UI.
        button.removeClass('ui-disabled');
      });
    }
  });
  

  doc.on({
    /**
     * Before show hook.
     */
    pagebeforeshow: function(event, ui) {
      // If the user is not logged in, show the login screen.
      if(null === Kinvey.getActiveUser() && $.mobile.activePage.attr( "id" ) !== 'register') {
        $.mobile.changePage(login);
      }
    },

    /**
     * Error hook.
     */
    error: function(e, data) {
      // Show popup on errors.
      $.mobile.loading('show', {
        text        : 'Failure: ' + data.name,
        textonly    : true,
        textVisible : true,
        theme       : 'e'
      });
      setTimeout(function() {
        $.mobile.loading('hide');
      }, 5000);
    }
  });


  // login.
  // -------
  var login = $('#login');
  login.on('pageinit', function() {
    // If the user is already logged in, skip the login screen.
    if( Kinvey.getActiveUser()!== null ) {
		console.log(Kinvey.getActiveUser());
      $.mobile.changePage(home);
    }

    // Login.
    login.on('submit', function(e) {
    	e.preventDefault();// Stop submit.
      var button = $(this).addClass('ui-disabled'); 
	  var username = $('#username').val().toLowerCase();
  	  var password = $('#password').val();

	var promise = Kinvey.User.login(username, password);
	
	promise.then(function() {
        $.mobile.changePage(home);// Redirect.
      }, function(error) {
        doc.trigger('error', error);
      }).then(function() {// Restore UI.
        button.removeClass('ui-disabled');
      });
      
    });
	
	//Register link
	$('#registerLink').click(function(e){
		e.preventDefault();
		$.mobile.changePage(register);	
	});
	
  });
  
  // Register.
  var register = $('#register');
  register.on('submit', function(e) {
    	e.preventDefault();// Stop submit.
      	var button = $(this).addClass('ui-disabled'); 
	  	var username = $('#registerUsername').val().toLowerCase();
  	  	var password = $('#registerPassword').val();
	  	var firstName =  $('#first_name').val();
	  	var lastName = $('#last_name').val();
	  	var registerEmail = $('#registerEmail').val();
 
 
var promise = Kinvey.User.signup({
    username : username,
    password : password,
	first_name : firstName,
	last_name : lastName,
	email : registerEmail
});

promise.then(function() {
        $.mobile.changePage(home);// Redirect.
      }, function(error) {
        doc.trigger('error', error);
      }).then(function() {// Restore UI.
        button.removeClass('ui-disabled');
      });
	  
	});
  // Home.
  // -----
  home.on({
    /**
     * Init hook.
     */
    pageinit: function() {
      // Build the query.
        var query = new Kinvey.Query();
        query.ascending('channelName');

        // Find channels
        var promise = Kinvey.DataStore.find('channels', query)
		
		promise.then(function(requests) {
          // Update channels.
		  console.log(requests);
          if(0 !== requests.length) {
			  var channel = requests;
			  
				$(channel).each(function(index, element) {
					$('#channels').append( '<input type="checkbox" name="channel" id="channel' + index + '" value="' + element.channelName +'"/><label for="channel' + index + '">' + element.channelName +'</label>');
				});
				$("input[type='checkbox']").checkboxradio();
          }
          else {
			  //fallback
            $('#channels').append(channelFallback);
          }
		  }, function(error) {
          doc.trigger('error', error);
		   $('#channels').append(channelFallback);
		   });
		
    },
	
    /**
     * Before show hook.
     */
    pagebeforeshow: function() {
      // Build the query
      
    }
	
	
	
  });
  
  //Add Place
	var addPlace = $('#addPlaceForm');
	addPlace.on('submit',function(e){
	e.preventDefault();// Stop submit.

	var button = $(this).attr('disabled', 'disabled'),
	//channelsArr = [],
	//dataObj = { },
	streetAddress = $.trim($('#streetAddress').val()),
	city = $.trim($('#locality').val()),
	state = $.trim($('#administrativeArea').val()),
	zip = $.trim($('#postalCode').val()),
				//addressInfo = $('#addressInfo').val(),
//				businessName = $('#businessName').val(),
//				contactName = $('#contactName').val(),
//				country = $('#country').val(),
//				description = $('#description').val(),
//				email = $('#email').val(),
//				fax = $('#fax').val(),
	latitude = "",
	longitude = "",
	userData_fromPage = addPlace.serializeArray();
	
	//addressArr = streetAddress.split(" "),
	//subThoroughfare = addressArr[0],
	//thoroughfare = streetAddress;
	
	$.post("getGeoInfo.php",{ 
					"street" : streetAddress,
					"city": city,
					"state": state,
					"zip": zip
		}).done(function( data ) {
			latitude = parseFloat(data.Latitude);
			longitude = parseFloat(data.Longitude);
	
			//dataObj["_geoloc"] = [longitude, latitude];
			//console.log("Geolocation : " + dataObj["_geoloc"]);
		
  }).fail(function(error) {
		//TODO: Add Error log or send email
		//For now flag with geocode of null
		//dataObj["_geoloc"] = null;
  }).always(function() {
		// Create data object to be pass to server
	 	var myDataObj = new DataObject(streetAddress, city, state, zip, latitude, longitude);
	 	myDataObj.AddToDataObject(userData_fromPage);

		$.mobile.loading.show;

		// Add the place
		var data = myDataObj.GetDataObject();
		
		//user must select atleast one channel  
		if(data.channels.length)
		{
			Kinvey.DataStore.save('places', data).then(function() {
			  $.mobile.changePage('#feedback');
	    	}, function(error) {
	     		 doc.trigger('error', error);
	    	}).then(function() {
			  // Restore UI.
			  $.mobile.loading.hide;
			  addPlace.trigger('reset');
			  button.removeAttr('disabled');
			});
		}
		else
		{
			alert("Please select atleast 1 (one) channel that corresponds to your business. Thank you.");
			return false;
		}
  });
});
	
}.call(this));


/************************ Data Object class ****************************************/
var DataObject = function(streetAddress, city, state, zip, latitude, longitude){
	
	this.channelsArr = [];
	this.addressArr = [];
	this.latitude = latitude;
	this.longitude = longitude;
	this.streetAddress = streetAddress;
	this.city = city;
	this.state = state;
	this.zip = zip;
	this.addressArr = streetAddress.split(" ");
	this.subThoroughfare = this.addressArr[0];
	this.thoroughfare = streetAddress;
	this.dataObj = {};
};

	
DataObject.prototype.AddToDataObject = function($arrayOfElements)
{
	//local scope cached so that it can be referenced when out of scope throughout methdod
	var that = this;
	
	function HasValue($ele)
		{
			var hasVal = false;
			if($ele !== undefined)
			{
				if($.trim($ele) !== "")
				{
					hasVal = true;
				}
			}
				
			return hasVal;	
		}

	$arrayOfElements.forEach(function($ele) {
		if($ele.name !== "channel" && $ele.name !== "streetAddress"){
			if(HasValue($ele.value))
			{
				that.dataObj[$ele.name] = $.trim($ele.value);
			}
		}
	});

	$('input[type="checkbox"]:checked').serializeArray().forEach(function(checkbox){
			that.channelsArr.push(checkbox.value);			
		});
		
	this.dataObj["channels"] = this.channelsArr;

	
	if(this.longitude !== "" || this.latitude !== "")
	{
		this.dataObj["_geoloc"] = [this.longitude, this.latitude];
	}
	
	this.dataObj["subThoroughfare"] = $.trim(this.subThoroughfare);
	
	//thoroughfare value cached in temporary variable.
	var temp = $.trim(this.thoroughfare.replace(this.subThoroughfare, ""));
	
	if(HasValue(temp))
	{
		this.dataObj["thoroughfare"] = temp;
	}
	
	this.dataObj["addedByWebsite"] = new Boolean(true);
	this.dataObj["source"] = "website";
};

DataObject.prototype.GetDataObject = function()
{		
	if(this.dataObj !== null)
	{
		console.log(this.dataObj);
		return this.dataObj;
	}
};

/*************************************************************************************************/












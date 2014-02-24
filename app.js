/****************************
 File: app.js
 Created by: Crystal Smith
 
 ***************************/
(function() {
  'use strict';

  // Setup.
  // ------	
var KINVEY_DEBUG = true;
var KinveyOnline = false;
var activeUserReady = false;
var user = {};
var res;
var defaultCategoryImage = "http://soulodex.net/app/images/places.png";
var currentChannel = null;
var currentPlace = null;
var doc = $(document);
var geoCoderKey = 'd9cf718cbf4d49b8a3c10f21bb2cbfbc';
var place = $('#place');
var event = $('#event');
var postTip = $('#postTip');
var addTip = $('#tipForm');
var register = $('#register');
var addPlace = $('#addPlaceForm');
var login = $('#login');
var loginFB = $('.loginFB');
var home = $('#home');
var channelPlaces = $('#channelPlaces');
var placeDetails = $('#placeDetails');
var placeEvents = [];
var placeTips = [];
var profile = $('#profile');
var editProfile = $('#editProfile');


 $( window ).hashchange(function() {
    var hash = location.hash;
 }); 

// Initialize Kinvey.
  var promise = Kinvey.init({
    appKey    : 'kid_Ve-Km89ZF',
    appSecret : 'cd116b36b3a741b78f26a8065ac39821',
    sync      : {
      enable : true,
      online : navigator.onLine
    }
  });
  promise.then(function(data) {
	 console.log("promise");
	 console.log(data);
     $.mobile.initializePage();// Render page.
	 $.mobile.changePage(home);
  }, function(error) {
	  console.log("error");
    console.log(error);
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
  
function calculateDistance(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = (lat2 - lat1).toRad();
  var dLon = (lon2 - lon1).toRad(); 
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(lat1.toRad()) * Math.cos(lat2.toRad()) * 
          Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d;
}
Number.prototype.toRad = function() {
  return this * Math.PI / 180;
}
function commit(form){
formmm.serializeArray().forEach(function(input) {
			if(input.name !== "placeId"){
				if(input.value !== "" && input.value !== null){ 
					dataObj[input.name] = $.trim(input.value);
	  				console.log(input.name + " : " + $.trim(input.value)); 
				}
			}
		});	
}
function getPlaceList(button){
//Show Loading
 $.mobile.loading('show');
 var list = $("#channelPlaceList");
 var button = $(".more");	 
	 if(typeof(Storage)!=="undefined"){
		 currentChannel = localStorage.getItem("Soulodex.channel.current");
		 localStorage.setItem("Soulodex.place.current", null);
	 }
	
	if(button){
		button.text("Loading...");
		//button.addClass('ui-disabled');
		//button.button( "refresh" );
	} 
	
	if(channelPlaces.data('skip') == 0){
		list.empty();
	}
	
	console.log("Channel : " + currentChannel);
		$.mobile.loading( "show" );

	//Get users current position
	navigator.geolocation.getCurrentPosition(function(loc) {
		console.log("Navigator");
   		 var coord = [loc.coords.longitude, loc.coords.latitude];
		 var query = new Kinvey.Query();

		 if(currentChannel !== null && currentChannel !== "null" ){
			query.contains('channels', [currentChannel]);
			 //Update title bar
			$('.ui-title[role="heading"]').text(currentChannel);
 		 } 
		 
		 if(typeof(channelPlaces.data('skip')) == "undefined"){
			channelPlaces.data('skip', 0);
		 }
		 
		 if(typeof(channelPlaces.data('reqLimit')) == "undefined"){
			channelPlaces.data('reqLimit', 50);
		 }
		 
		//console.log("Skip: " + channelPlaces.data('skip'));
		//console.log("Limit: " + channelPlaces.data('reqLimit'));
 
		 //Set Distance
		 query.skip(channelPlaces.data('skip'))
             .limit(channelPlaces.data('reqLimit'))
			  .near('_geoloc', coord, null);
		 	  

       var promise = Kinvey.DataStore.find('places', query, {
		 //offline : true,
        success : function(response) {
			console.log("Response");
			console.log(response);
			if(response.length !== 0) {
				if(response.length >= channelPlaces.data('reqLimit')){
				 channelPlaces.data('skip', channelPlaces.data('skip') + channelPlaces.data('reqLimit'));
				 	if(button){
						button.removeClass("hidden");
						button.show();
						button.text("More");
						
					}
				} else {
					if(button){
						button.text("More");
						button.hide();
					}
				}
			  	$(response).each(function(index, element) {
					if(typeof(element.businessName) !== "undefined"){
						var distance = calculateDistance(coord[1], coord[0], element._geoloc[1], element._geoloc[0]);	
						var placeName = (element.businessName != null && element.businessName != "" ) ? element.businessName : "No Business";
						var contact  = (element.contactName !== null && typeof(element.contactName) !== "undefined" && element.contactName != "" ) ? element.contactName : "No Name";
						var phone = (element.phoneNumber !== null && typeof(element.phoneNumber) !== "undefined" && element.phoneNumber != "" ) ? element.phoneNumber : "No Phone";
						var email = (element.email !== null  && typeof(element.email) !== "undefined" && element.email != "" ) ? element.email : "No Email";
					
					
					
					
					list.append("<li><a href=\"#\" class=\"place\" id=\"" + element._id + "\"><div class=\"" + element._id + "placeEvents\"></div><div class=\"" + element._id + "placeTips\"></div><h4>" + placeName.toUpperCase() + "</h4><div class='contactContainer'><p>Contact: " + contact + " <br /> Phone: " + phone + "<br />Email: " + email + "</p></div><div class='distanceContainer'><p>" + distance.toFixed(2) + "<br />miles</p></div></a></li>");
					list.listview("refresh");
					}					
				if(element.eventCount > 0 && $("." + element._id + "placeEvents")){
										//$("." + element._id + "placeEvents").empty();
										console.log("." + element._id + " placeEvents " + element.eventCount);
										$("." + element._id + "placeEvents").append(" " + element.eventCount + " Event(s)");
									}
									if(element.tipCount > 0 && $("." + element._id + "placeTips")){
										//$("." + element._id + "placeTips").empty();
										console.log("." + element._id + "placeTips " + element.tipCount);
										$("." + element._id + "placeTips").append(element.tipCount + " Tip(s) ");
									}
									//Update view
									list.listview("refresh");
					
					if(button){
						button.removeClass('ui-disabled');
					}
					

				});
				$.mobile.loading( "hide" );
          } else {
			  $.mobile.loading( "hide" );

				 list.append("<h3>No Places Listed for this Channel</h3>");
				if($(".more")){
				 	$(".more").hide();
					
					
				 }
		  }
		 
		}
	});
});
}

function getChannels(){
	
// Build the query.
        var query = new Kinvey.Query();
		 var channel = null;
		 var categories = [];
		 var cat = "";
		 var accordion = $('div [name="channelAccordion"]');
		 var collapsible = "";
		 var list = "";
		//Reset current channel selection
		currentChannel = null;
		currentPlace = null;
		
		//update header title
		$('.ui-title[role="heading"]').text("Soulodex");
		
		//Reset Selection
		accordion.empty();
 

        // Find channels
		query.ascending('category');
		query.equalTo('showChannelOnHomeScreen',true);
		var promise = Kinvey.DataStore.find('channels', query)

		promise.then(function(requests) {
		  //loading
		  $.mobile.loading( "show" );
		  
          // Update channels.
		 //console.log(requests);
          if(requests.length !== 0) {
			  channel = requests;
				$(channel).each(function(index, element) {
					cat = $.trim(element.category);
					if($.inArray(cat,categories) == -1 && typeof(cat) !== "undefined"){
						categories.push(cat);
						console.log(cat);
						if(categories.length > 1){
							collapsible.append(list);
							accordion.append(collapsible);
        					accordion.trigger('create');
						}
						collapsible = $('<div data-role="collapsible" id="' + cat + 'collapsible">');
			  			list = $('<ul data-role="listview" data-inset="true" data-theme="d" data-divider-theme="e"  id="' + cat + 'listview">');
						collapsible.append("<h3>" + cat + "</h3>");
					}
					console.log(" - " + element.channelName );
					//$.get("soulodex.net/app/images/" + cat.toLowerCase() + ".jpg", function( data ) {
//					 //console.log(cat + ".jpg Successful");
//					}).fail(function() {
//						$('img[src="images/' + cat.toLowerCase() + '.jpg"]').attr('src', defaultCategoryImage);
//					});
					list.append("<li><a href=\"#\"  class=\"channel\" title=\"" + $.trim(element.channelName) + "\"><img src='images/" + cat.toLowerCase() + ".png' class='ui-li-icon'/>" + $.trim(element.channelName) + "</a></li>");
				});
					collapsible.append(list);
							accordion.append(collapsible);
        					accordion.trigger('create');

          }
		  		$.mobile.loading( "hide" );

		  }, function(error) {
			 $.mobile.loading( "hide" );
          	doc.trigger('error', error);
		  });	
}
//update password
function updatePassword(){
	var user = Kinvey.getActiveUser();
	user.password = 'new-password';
	var promise = Kinvey.User.update(user, {
		success: function(response) {
			console.log("Password updated");
		}
	});
}

function loginGuest(){
	//create a default user
			$.post("db.php",{ 
				"operation": null
				}).done(function( data ) {
					if(data){
						console.log(data);
						var res = $.parseJSON(data);
						if(res.response){
							//get User
							user = $.parseJSON(res.response);
							Kinvey.setActiveUser({
								username: user.username,
								_id: user._id,
								_kmd: {
									authtoken: user._kmd.authtoken
								}
							});
							if(typeof(Storage)!=="undefined"){
								var storedUser = [user._id, user._kmd.authtoken];
								localStorage.setItem("Kinvey.kid_Ve-Km89ZF.activeUser", JSON.stringify(storedUser));
							}
							getChannels();
						} else {
							if(res.error !== null || res.error !== ""){
								//console.log("error");
								var err = $.parseJSON(res);
								err["name"] = err.description;
								//console.log(err.name);
								doc.trigger('error', err);
								
								$.mobile.changePage(login);// Redirect.
							}
						}
						
					}
					
				}).fail(function(error) {
					console.log("Guest login failed");
					//doc.trigger('error', error);
					loginGuest();
				}).always(function() {
				});
	
}
function getTips(element,domElement) {
	//Get Tip and Event Count for each place
	console.log("getTips");
	console.log(element);
	
	if(typeof(element.tipIds) !== "undefined"){
		console.log(element.tipIds);
		placeEvents = [];
		placeTips = [];
		
		//Query for tips
		var query = new Kinvey.Query();
		query.contains('_id', element.tipIds);
		Kinvey.DataStore.find('tips', query).then(function(response) {
				if(response.length > 0){
					console.log("Tips");
					console.log(response);
					$(response).each(function(index, element) {
						if(element.isEvent !== "undefined"){
							if(element.isEvent == true){
								console.log(element);
								placeEvents.push(element);
							} else {
								placeTips.push(element);
							}
						} else {
							placeTips.push(element);
						}
					});
					console.log(placeEvents.length);
					console.log(placeTips.length);

					
						if(placeEvents.length > 0){
								$(".eventHeader").append("Events");
						
								for(var i=0; i < placeEvents.length; i++) {
									console.log(i);
									if(typeof(placeEvents[i]) !== "undefined"){
									console.log(typeof(placeEvents[i].startDate) !== "undefined");
									if(typeof(placeEvents[i].startDate) !== "undefined") {
										if(placeEvents[i].startDate !== "" && placeEvents[i].startDate !== null){
											var str = placeEvents[i].startDate;
											var patt1 = /[ISODate()"z]/g;
											var result = str.replace(patt1,"");
											
											var nDate = new Date(result);
											console.log(nDate);
											console.log(result);
											if(nDate !== "Invalid Date"){
												var formattedDate = fromISO(result);
												var startDateEvent = formattedDate ;
											} else {
												var startDateEvent = placeEvents[i].startDate ;
											}
										} else {
											var startDateEvent = "Not applicable";
										}
									} else {
										var startDateEvent = "Not applicable";
									}
									
									
									if(typeof(placeEvents[i].tipTitle) !== "undefined") {
										if(placeEvents[i].tipTitle !== "" && placeEvents[i].tipTitle !== null){
											var tipTitleEvent = placeEvents[i].tipTitle; 
										} else {
											var tipTitleEvent = "No Title";
										}
									} else {
											var tipTitleEvent = "No Title";
									}

									if(typeof(placeEvents[i].message) !== "undefined"){
										if(placeEvents[i].message !== "" && placeEvents[i].message !== null){ 
											var messageEvent = placeEvents[i].message;
										} else {
											var messageEvent = "No description";
										}
									} else {
											var messageEvent = "No description";
									}

									if(typeof(placeEvents[i].userName) !== "undefined"){
										if(placeEvents[i].userName !== "" && placeEvents[i].userName !== null){
											var tipUserEvent =  placeEvents[i].userName;
										} else {
											var tipUserEvent = "Anonymous";
										}
									}else {
										var tipUserEvent = "Anonymous";
									}
									
									//Update dom
									$("#eventList").append("<li><p class='date'>"+ tipTitleEvent + "</p><p>Start Date: " + startDateEvent + "</p><p>" + messageEvent + "</p><p>" + tipUserEvent + "</p></li>");

								//Update Layout
								$('#eventList').listview("refresh")
								console.log("end events");
									
								}
								//$('#eventList').trigger('refresh');
							}
								
							} 
							console.log("Place tips : " + placeTips.length);
							if(placeTips.length > 0) {
								$(".tipHeader").append("Tips");
								for(var i=0; i < placeTips.length; i++) {
									console.log("Place Tip "+ i);
									if(typeof(placeTips[i]) !== "undefined"){
									if(typeof(placeTips[i].tipTitle) !== "undefined"){
										if(placeTips[i].tipTitle !== "" && placeTips[i].tipTitle !== null){
											var tipTitle =  placeTips[i].tipTitle;
										} else {
											var tipTitle = "No Title";
										}
									} else {
										var tipTitle = "No Title";
									}
									var message = (typeof(placeTips[i].message) !== "undefined" && placeTips[i].message !== "" && placeTips[i].message !== null) ? placeTips[i].message : "No description";
									var tipUser = (typeof(placeTips[i].userName) !== "undefined" && placeTips[i].userName !== "" && placeTips[i].userName !== null) ? placeTips[i].userName : "Anonymous";

									//Update Dom
									$("#tipList").append("<li><p>"+ tipTitle + "</p><p>" + message + "</p><p>" + tipUser + "</p></li>");
									$('#tipList').listview("refresh");
								}
								
								}
							} 
					} else {
						 console.log("there was a problem loading tips");
						 console.log(response);
						 $("#tipList").append('<p class="tips">No Tips for this place, be the first to add one!</p><a href="#postTip" class="postTip ui-shadow ui-btn-corner-all ui-btn-up-a" data-role="button">Add Tip Here!</a>');	
						 $("#tipList").listview("refresh");
					}
			},function(error) {
			doc.trigger('error', error);
		}).always(function() {
			 $("#tipList").listview("refresh");	
		});	
		} else {
		$("#tipList").append('<p class="tips">No Tips for this place, be the first to add one!</p><a href="#postTip" class="postTip ui-shadow ui-btn-corner-all ui-btn-up-a" data-role="button">Add Tip Here!</a>');	
			 $("#tipList").listview("refresh");	
		}
}

//Update Place with Tip Ids
function updatePlaceTip(placeId_LS, tip, tipChannelsArr){
	console.log("updatePlaceTip");
	console.log(tip);
	
	//Update Place with tipId
	var query = new Kinvey.Query();
	query.equalTo("_id", placeId_LS);
	Kinvey.DataStore.find('places', query).then(function(response) {
		console.log("updatePlaceTip response");
		console.log(response);
			if(response.length > 0){
				$(response).each(function(index, element) {
					console.log("element");
					console.log(element);
				if(typeof(element.tipIds) !== "undefined"){
					console.log(element.tipIds);
					element.tipIds.push(tip._id);
				} else {
					element["tipIds"] = [tip._id];
					console.log(element["tipIds"]);
				}
				if(typeof(element.channels) !== "undefined"){
					if(tipChannelsArr.length > 0){
						for(var i=0; i < tipChannelsArr.length ; i++){
							element.channels.push(tipChannelsArr[i]);
						}
					}
					
				} else {
					if(tipChannelsArr.length > 0){
						element["channels"] = [];
						for(var i=0; i < tipChannelsArr.length; i++){
							element["channels"].push(tipChannelsArr[i]);
						}
					}
				}
				if(tip.isEvent == true || tip.isEvent == "true"){
					if(!isNaN(element.eventCount) && typeof(element.eventCount) !== "undefined"){
						element.eventCount = element.eventCount + 1;	
					} else if(element.eventCount == "" || element.eventCount == null){
						element.eventCount = 0;
						element.eventCount = element.eventCount + 1;
					} else {
						element.eventCount = 0;
						element.eventCount = element.eventCount + 1;
					}
				} else {
					console.log(element.tipCount);
					if(!isNaN(element.tipCount) && typeof(element.eventCount) !== "undefined"){
						element.tipCount = element.tipCount + 1;
					} else if(element.tipCount == "" || element.tipCount == null){
						element.tipCount = 0;
						element.tipCount = element.tipCount + 1;
					} else {
						element.eventCount = 0;
						element.eventCount = element.eventCount + 1;
					}
				}
				 Kinvey.DataStore.save('places', element).then(function(res) {
					console.log("TipId saved");
					console.log(res);
					$.mobile.changePage(placeDetails);
				}, function(error) {
     		 		doc.trigger('error', error);
    			});
				
				});
			} else {
				console.log("There was a problem updating place with tipId");	
				console.log(response);
			}
		},function(error) {
			doc.trigger('error', error);
		}).then(function() {
			$.mobile.loading("hide")
	});			
}
		  
		  

//Update the Event or Tip count for a place
function updateTipEventCount(tipObj){
	
			console.log(tipObj);
			console.log(tipObj._id + " : " + tipObj.isEvent);
			
			var placeObj = {};
			
			
			//Get Current Tip Count
			var promise = Kinvey.DataStore.find('places', tipObj._id  , {
				success: function(response) {
					
					console.log(response);
						placeObj = response;
						
						if(tipObj.isEvent == "true"){
						console.log(placeObj);
						console.log("Event Count : " + placeObj.eventCount++);
						
						placeObj.eventCount = placeObj.eventCount++;
						console.log(placeObj);
					} else {
						
						console.log(placeObj);
						console.log("Tip Count : " + placeObj.tipCount++);
						placeObj.tipCount = placeObj.tipCount++;
						console.log(placeObj);
					}
				}
			});
			

	Kinvey.DataStore.save('places', placeObj).then(function() {
			console.log("place event tip count updated");
			console.log(placeObj);
    	}, function(error) {
     		 doc.trigger('error', error);
    	}).then(function() {
		  
		  
		});	
}

function getChannelList(){
	 // Find channels
	 // Build the query.
	 	var placeChannels = localStorage.getItem("placeChannels");
        var query = new Kinvey.Query();
        query.ascending('channelName');
		
		var promise = Kinvey.DataStore.find('channels', query);
		
		promise.then(function(requests) {
          // Update channels.
		 console.log(requests);
          if(requests.length !== 0) {
			  $('div[name="channelList"]').empty();
			  var channel = requests;
			  var block = "ui-block-c";
		
				$(channel).each(function(index, element) {
					  if(window.screen.width >= 768){
						if(block == "ui-block-c"){
							block = "ui-block-a";
						}else if(block == "ui-block-a"){
							block = "ui-block-b";
						} else  {
							block = "ui-block-c";
						}
					  } else {
						  block = "";
					  }
					  if(placeChannels.length > 0 && placeChannels.match(element.channelName) != null){
						  $('div[name="channelList"]').append( '<div class="channellist '+ block + '"><input type="checkbox" checked disabled name="channel" id="channel' + index + '" value="' + element.channelName +'"/><label for="channel' + index + '">' + element.channelName +'</label></div>');
					  } else {
						$('div[name="channelList"]').append( '<div class="channellist '+ block + '"><input type="checkbox" name="channel" id="channel' + index + '" value="' + element.channelName +'"/><label for="channel' + index + '">' + element.channelName +'</label></div>');
					  }
				});

				
				$('div[name="channelList"]').trigger('create');
          }
		 
		  
		  }, function(error) {
          doc.trigger('error', error);
		  });	
}



  doc.on('click', '.logout', function() {
    if(null !== Kinvey.getActiveUser()) {
      var button = $(this).addClass('ui-disabled');

      // Logout the active user.
      Kinvey.User.logout().then(function() {
		 // Kinvey.Sync.destruct();
        $.mobile.changePage(home);// Redirect.
      }, function(error) {
        doc.trigger('error', error);
      }).then(function() {// Restore UI.
        button.removeClass('ui-disabled');
      });
    }
  });
  
 doc.on('click', '.event', function() {
    $.mobile.changePage(event);
  });
  
  doc.on('click', '.save', function() {
	 // e.preventDefault();// Stop submit.	  
	  var saveDataObj = { };
	  var button = $(this).attr('disabled', 'disabled');
	  
	  saveDataObj["_id"] = Kinvey.getActiveUser()._id;
	  
	  
	  //Loading
	  $.mobile.loading('show');
	  
	

   	$('#editProfileForm').serializeArray().forEach(function(input) {
		if(input.value !== "" && input.value !== null && input.value !== "     "){ 
			saveDataObj[input.name] = $.trim(input.value);
			console.log(input.name + " : " + $.trim(input.value)); 
		} 
	});
	
if(Kinvey.getActiveUser().usernameFixed !== true)  {
	  	if(saveDataObj["username"] !== null && saveDataObj["username"] !== ""){
			saveDataObj["usernameFixed"] = "fixed";
		}
	  }
	  
		var button = $(this).attr('disabled', 'disabled');


		//Edit Profile
    	console.log(saveDataObj);
		if(saveDataObj["username"] !== "" || saveDataObj["username"] !== null){
		Kinvey.User.update(saveDataObj).then(function() {
			  alert("Profile Updated")
    	}, function(error) {
			$.mobile.loading('hide');
			doc.trigger('error', error);
    	}).then(function() {
		  // Restore UI.
		  $.mobile.loading('hide');
		  button.removeAttr('disabled');
		  
		});
		} else {
			alert("Username is required");	
		}
  });
  
  $('a.back').click(function(){
        parent.history.back();
        return false;
    });
	//Select Channel
	  doc.on('click', '.channel', function(){
		  currentChannel = $(this).text();
		if(typeof(Storage)!=="undefined"){
			console.log("Local storage " + currentChannel);
			localStorage.setItem("Soulodex.channel.current", currentChannel);
		}
		  $.mobile.changePage(channelPlaces);
    });
	//Select Place
	 doc.on('click', '.place', function(){
		   currentPlace = $(this);
		   if(typeof(Storage)!=="undefined"){
				localStorage.setItem("Soulodex.place.current", currentPlace.context.id);
			}
			
		  $.mobile.changePage(placeDetails);
    });
	
	 //Select Post Tip  
	 doc.on('click', '.postTipLink[href="#channelPlaces"]', function(){
		
		 $('.ui-title[role="heading"]').text("Select Place");
		 if($(".addPlace[data-role='button']").text() !== "Add Tip"){
		 	//$('div[data-role="header"]').append('<a class="ui-btn-right addPlace" href="#place" data-role="button" data-theme="a">Add Place</a>');
		 }
		 currentChannel = null;
		if(typeof(Storage)!=="undefined"){
			localStorage.setItem("Soulodex.channel.current", currentChannel);
		}
		if($.mobile.activePage[0].id == "channelPlaces"){
			console.log("Active Page the same"); 	
			getPlaceList();
			
		} else {
		 $.mobile.changePage(channelPlaces);

		}
		 
		//var pageList = $('ul[data-role="listview"]');
//		if(pageList){
//			$('ul[data-role="listview"]').listview("refresh");
//		}
	});
	
	//Select Post Tip
	 doc.on('click', '.allTipsLink[href="#channelPlaces"]', function(){
		if($('.ui-title[role="heading"]').text() !== "All Tips"){
		 	$('.ui-title[role="heading"]').text("All Tips");
		}
		
		 currentChannel = null;
		if(typeof(Storage)!=="undefined"){
			localStorage.setItem("Soulodex.channel.current", currentChannel);
		}
		if($.mobile.activePage[0].id == "channelPlaces"){
			console.log("Active Page the same"); 	
			getPlaceList();
			
		} else {
		 $.mobile.changePage(channelPlaces);

		}
	});
	
	//Forgot Username
	doc.on('click', '.forgotUsername', function(){
		$( "#dialog").remove('p');
		$( "#dialog").append("<p></p>");
		$(function() {
    		$( "#dialog" ).dialog();
  		});
		var promise = Kinvey.User.forgotUsername('email', {
			success: function() {
				alert("Your username has been sent to your email.");
			}
		});
	});
	
	//Password Reset
	doc.on('click', '.passwordReset', function(){
		var promise = Kinvey.User.resetPassword('username', {
			success: function() {
				alert("Password reset has been sent to your email");
			}
		});
	});
	
	//Toggle Date input
 $('#isEvent').change(function() {
		$(".isEvent").toggle();
  });
  // More.
      channelPlaces.on('click', '.more', function() {
        //var button = $(this).addClass('ui-disabled');

        getPlaceList($(this));
		
		//button.removeClass('ui-disabled');
      });

  doc.on({
	  //Page init
	   /**
     * Init hook.
     */
		pageinit: function() {
			
		 
		},
    /**
     * Before show hook.
     */
    pagebeforeshow: function(event, ui) {
		console.log("pagebeforeshow");
		currentChannel = localStorage.getItem("Soulodex.channel.current");
		channelPlaces.data('skip', 0);
		
		if($('.more')){
			$('.more').show;	
			$('.more').removeClass('ui-disabled');
		}
		
		
		
		if(Kinvey.getActiveUser() !== null && typeof(Kinvey.getActiveUser._socialIdentity) !== "undefined"){
			if(Kinvey.getActiveUser().usernameFixed !== "fixed"){
				$.mobile.changePage(editProfile);
			}
		} 
   	
		  
			//create footer menu
		 	var output = ['<div data-role="navbar"><ul>'];

			//push items onto the output array
			output.push('<li><a href="#home" data-icon="home" data-theme="a">Dashboard</a></li>');
			output.push('<li><a href="#channelPlaces" class="postTipLink" data-icon="search" data-theme="a">Post a Tip</a></li>');
			output.push('<li><a href="#place" class="addPlaceLink" data-icon="add" data-theme="d">Add Place</a></li>');
			output.push('<li><a href="#channelPlaces" class="allTipsLink" data-icon="search" data-theme="a">All Tips</a></li>');
			output.push('<li><a href="#profile" class="profileLink" data-icon="gear" data-theme="a">Profile</a></li>');

			output.push('</ul></div>');
			
			$('[data-role="footer"]').html(output.join('')).trigger('create');
 
	 
	 
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
        theme       : 'a'
      });
      setTimeout(function() {
        $.mobile.loading('hide');
      }, 10000);
    },
 
  
});
  // login.
  // -------
  login.on('pageinit', function() {
	 //console.log("login pageinit");
    // If the user is already logged in, skip the login screen.
	
	
    
    // Login.
    login.on('submit', function(e) {
    	e.preventDefault();// Stop submit.
		
      var button = $(this).addClass('ui-disabled'); 
	  var username = $('#username').val().toLowerCase();
  	  var password = $('#password').val();
	  Kinvey.User.logout().then(function() {
		 // Kinvey.Sync.destruct();
       var promise = Kinvey.User.login(username, password);
	  
	   promise.then(function() {
        $.mobile.changePage(home);// Redirect.
      }, function(error) {
        doc.trigger('error', error);
      }).then(function() {// Restore UI.
        button.removeClass('ui-disabled');
      });

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
  
  
   //Social Login.
   //facebook
    doc.on('click', '.loginFB', function() {
      var button = $(this).addClass('ui-disabled');

      Kinvey.Social.connect(null, 'facebook').then(function(response) {
		 //console.log(response);
		  $.mobile.changePage(home); //Redirect.
	  }, function(error) {
		 doc.trigger('error', error);
	  }).then(function() {	//Restore UI.
		 button.removeClass('ui-disabled');
	  });
	
	});
	//linkedIn
	doc.on('click', '.loginLinkedIn', function() {
      var button = $(this).addClass('ui-disabled');

      Kinvey.Social.connect(null, 'linkedIn').then(function(response) {
		 //console.log(response);
		  $.mobile.changePage(home);//Redirect.
	  }, function(error) {
		 doc.trigger('error', error);
	  }).then(function() {// Restore UI.
		 button.removeClass('ui-disabled');
	  });
	
	});
  
  // Register.
   register.on({
    /**
     * Init hook.
     */
		pageinit: function() {
		},
		pageBeforeShow: function(){
			 if(null !== Kinvey.getActiveUser()) {
			  $.mobile.changePage(home);
			}
		}
   });
  register.on('submit', function(e) {
    	e.preventDefault();// Stop submit.
      	var button = $(this).addClass('ui-disabled'); 
	  	var username = $('#registerUsername').val().toLowerCase();
  	  	var password = $('#registerPassword').val();
	  	var firstName =  $('#first_name').val();
	  	var lastName = $('#last_name').val();
	  	var registerEmail = $('#registerEmail').val();
		
		//requires the active user not to be set.
		 if(null !== Kinvey.getActiveUser()) {
			 Kinvey.User.logout({ force: true });
			  $.mobile.changePage(home);
			}
  
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
	
	
	  // home.
  // -----
 home.on({
    /**
     * Init hook.
     */
    pageinit: function() {
		//console.log("Home pageinit");
		
     
    },
	
    /**
     * Before show hook.
     */
    pagebeforeshow: function(event) {
		if(null == Kinvey.getActiveUser()){
			
		  loginGuest();
			
		} else {
			getChannels();	
		}
       
		
    }
	
	
	
  });
	//Channel Places
	 channelPlaces.on({
    /**
     * Init hook.
     */
    pageinit: function() {
		console.log("Channel pageinit");
		
 },
	
    /**
     * Before show hook.
     */
    pagebeforeshow: function(event) {
		if($('.more')){
			$('.more').toggle();
		}
   		getPlaceList(); 
    }
  });
	//Place Details
	 placeDetails.on({
    /**
     * Init hook.
     */
    pageinit: function() {
		console.log("PlaceDetails init");
 	},
	
    /**
     * Before show hook.
     */
    pagebeforeshow: function(event) {
      //Get current place
	 //console.log(localStorage.getItem("Soulodex.place.current"));
	
		console.log("Place beforeshow");
		
		$('#placeDetails ul[data-role="listview"]').empty();
		$(".eventHeader").empty();
		$("#eventList").empty();
		$(".tipHeader").empty();
		$("#tipList").empty();
		
		var placeLocation = $("#placeLocation");
		var placeId_LS = localStorage.getItem("Soulodex.place.current");
		var tips;
		var query = new Kinvey.Query();
		
		//Check the currentPlace object
		//if(currentPlace !== null && typeof(currentPlace)!== "undefined"){
//			if(currentPlace.context !== null && typeof(currentPlace.context)!== "undefined"){
//		   		query.equalTo("_id", currentPlace.context.id);
//			}
//		console.log('currentPlace object');
//		} else {
				
			//Get the place id stored in localstorage
	 		console.log('placeId_LS object');
			query.equalTo("_id", placeId_LS);
//		}
//loading
		 $.mobile.loading( "show" );
       // Find Place
		 Kinvey.DataStore.find('places', query).then(function(requests) {
			if(requests.length > 0){
				console.log("Place details");
				console.log(requests);
			$(requests).each(function(index, element) {
				
				var placeName = (element.businessName != null && element.businessName != "" ) ? element.businessName : "No Business";
				var contact  = (element.contactName != null && typeof(element.contactName) !== "undefined" && element.contactName != "" ) ? element.contactName : "No Name";
				var phone = (element.phoneNumber != null && typeof(element.phoneNumber) !== "undefined" && element.phoneNumber != "" ) ? element.phoneNumber : "No Phone";
				var fax = (element.fax != null && typeof(element.fax) !== "undefined" && element.fax != "" ) ? element.fax : "No Fax";
				var email = (element.email !== null  && typeof(element.email) !== "undefined" && element.email != "" ) ? element.email : "No Email";
				var website = (element.website !== null  && typeof(element.website) !== "undefined" && element.website != "" ) ? element.website : "No Website";
				var state = (element.administrativeArea !== null  && typeof(element.administrativeArea) !== "undefined" && element.administrativeArea != "" ) ? element.administrativeArea : "";
				var city = (element.locality !== null  && typeof(element.locality) !== "undefined" && element.locality != "" ) ? element.locality : "";
				var streetNumber = (element.subThoroughfare !== null  && typeof(element.subThoroughfare) !== "undefined" && element.subThoroughfare != "" ) ? element.subThoroughfare : "";
				var streetAddress = (element.thoroughfare !== null  && typeof(element.thoroughfare) !== "undefined" && element.thoroughfare != "" ) ? element.thoroughfare : "";
				var zip = (element.postalCode !== null  && typeof(element.postalCode) !== "undefined" && element.postalCode != "" ) ? element.postalCode : "";
				var address = streetNumber + " " + streetAddress + "<br /> " +  city +", " + state + " " + zip +"<br />" + element.country;
				var channelsArray = (element.channels !== null  && typeof(element.channels) !== "undefined" && element.channels != "" ) ? element.channels : "";
				console.log(placeName);
				localStorage.setItem( "Soulodex.place.formatedHtml", "<li><a href=\"#\">" + placeName.toUpperCase() + "</a></li><li><a href=\"#\">" + address + "</a></li><li><a href=\"tel:" + phone + "\" data-rel=\"external\">" + phone + "</a></li><li><a href=\"mailto:" + email + "\" data-rel=\"external\">" + email + "</a></li><li><a href=\"" + website + "\">" + website + "</a></li><li><a href=\"#\">" + fax + "</a></li>");	
				
				//Update Storage of formated place details for use on the tips page
				currentPlace["formattedHtml"] = localStorage.getItem("Soulodex.place.formatedHtml");
				
				//Update header title
				$('.ui-title[role="heading"]').text(placeName);
				
				placeLocation.append(currentPlace["formattedHtml"]);
				placeLocation.append("<li><a href=\"#postTip\" class=\"postTip\" data-role=\"button\">Add Tip Here!</a></li>");

				console.log(placeLocation);
				$("#POC").append("<li>" + contact + "<li>");
			
				if(channelsArray.length > 0){
					console.log(channelsArray);
					localStorage.setItem("placeChannels",channelsArray);
					for(var i=0; i < channelsArray.length; i++) {
						console.log("Channel : " + channelsArray[i]);
						$("#otherChannels").append("<li>" + channelsArray[i] + "</li>");
					}
				}
				//Update Layout
				$('#placeDetails ul[data-role="listview"]').listview("refresh");
				
				//Get Tips
				getTips(element, null);		
			});
			
			
			//Stop loading
		  	$.mobile.loading( "hide" );
			
			} else {
				var error = { };
				//Stop loading
		  		$.mobile.loading( "hide" );
					error["name"] = 'Error retrieving place details';
					$.mobile.changePage(channelPlaces);
					 doc.trigger('error', error);	
			}
			//Stop loading
		  $.mobile.loading( "hide" );
		});
		
	}
});
  // place.
  // -----
  place.on({
    /**
     * Init hook.
     */
    pageinit: function() {
		console.log("place pageinit");

		
    },
	
    /**
     * Before show hook.
     */
    pagebeforeshow: function(event) {
		//Redirect to login
		if(Kinvey.getActiveUser() == null || Kinvey.getActiveUser().username == "Guest"){
        $.mobile.changePage(login);
      }

		
		// Build the query.
        var query = new Kinvey.Query();
        query.ascending('channelName');
		//query.equalTo('showChannelOnHomeScreen', 'true');

        // Find channels
		var promise = Kinvey.DataStore.find('channels', query);
		
		promise.then(function(requests) {
          // Update channels.
		 console.log(requests);
          if(requests.length !== 0) {
			  $('#channels').empty();
			  var channel = requests;
			  var block = "ui-block-c";
		
				$(channel).each(function(index, element) {
					  if(window.screen.width >= 768){
						if(block == "ui-block-c"){
							block = "ui-block-a";
						}else if(block == "ui-block-a"){
							block = "ui-block-b";
						} else  {
							block = "ui-block-c";
						}
					  } else {
						  block = "";
					  }
					$('#channels').append( '<div class="channellist '+ block + '"><input type="checkbox" name="channel" id="channel' + index + '" value="' + element.channelName +'"/><label for="channel' + index + '">' + element.channelName +'</label></div>');
				});
				//$("input[type='checkbox']").checkboxradio();
				$('#channels').trigger('create');
          }
		  }, function(error) {
          doc.trigger('error', error);
		   });
    }
	
	
	
  });
   //Profile Screen
	 profile.on({
		/**
		 * Init hook.
		 */
		pageinit: function() {
			
        
			
		},
		
		/**
		 * Before show hook.
		 */
		pagebeforeshow: function(event) {
			//Redirect to login
			var aUser = Kinvey.getActiveUser();
			 //Redirect to login
			if(Kinvey.getActiveUser() == null || Kinvey.getActiveUser().username == "Guest"){
        		$.mobile.changePage(login);
      
		  	} else {
				var profileEmail = $('#profileEmail');
				var profileBio = $('#profileBio');
				var profileName = $('#profileName');
				
				$('#profile ul[data-role="listview"]').empty();
				//Social Info
				if(typeof(aUser._socialIdentity) !== "undefined" && aUser._socialIdentity !== null){
					if(typeof(aUser._socialIdentity.facebook) !== "undefined"){
					var profileUser_name = (null != aUser._socialIdentity.facebook) ? aUser._socialIdentity.facebook.name : aUser.first_name + " " + aUser.last_name;
					var profileUser_email = (null != aUser._socialIdentity.facebook) ? aUser._socialIdentity.facebook.email : aUser.email;
					} else if(typeof(aUser._socialIdentity.linkedIn) !== "undefined"){
						var profileUser_name = (null != aUser._socialIdentity.linkedIn) ? aUser._socialIdentity.linkedIn.name : aUser.first_name + " " + aUser.last_name;
					var profileUser_email = (null != aUser._socialIdentity.linkedIn) ? aUser._socialIdentity.linkedIn.email : aUser.email;
					}
				} else {
					var firstName = (typeof(aUser.first_name) !== "undefined" && aUser.first_name !== "") ? aUser.first_name : "";
					var lastName = (typeof(aUser.last_name) !== "undefined" && aUser.last_name !== "") ? aUser.last_name : "";
					var profileUser_name = firstName + " " + lastName;
					var profileUser_email = (typeof(aUser.email) !== "undefined") ? aUser.email : "";	
				}
				var profileUser_bio =  (typeof(aUser.userBio) !== "undefined") ? aUser.userBio : "";
				
				profileName.append('<li>User Name: <right>' + aUser.username + '</right></li><li>Name:  <right>' + profileUser_name + '</right></li>' );
				profileEmail.append('<li>' + profileUser_email + '</li>' );
				profileBio.append('<li>' + profileUser_bio + '</li>' );

			$('#profile ul[data-role="listview"]').listview("refresh");

			}
		}
	 });
	 
	 
	 //Edit Profile
	 editProfile.on({
		pageinit: function(){},
		pagebeforeshow: function(){
		
				var editProfileUsername = $('#editProfileUsername');
				var editProfileEmail = $('#editProfileEmail');
				var editProfilePassword = $('#editProfilePassword');
				var editProfileFirstName = $('#editProfileFirst_name');
				var editProfileLastName = $('#editProfileLast_name');
				var editProfileBio = $('#editProfileUserBio');
				
				var aUser = Kinvey.getActiveUser();
				
		
				Kinvey.User.me({
					success: function(response) {
						//update active User
					}
				});
					$('#editProfile ul[data-role="listview"]').empty();
			
			
			
				//Social Info
				if(typeof(aUser._socialIdentity) !== "undefined"){
				var profileUser_email = (null != aUser._socialIdentity.facebook) ? aUser._socialIdentity.facebook.email : aUser.email;
				} else {
					var profileUser_email = aUser.email;
				}
				var profileUser_bio =  (typeof(aUser.userBio) != "undefined") ? aUser.userBio : "";
				
				//Alert User to create username
			if(Kinvey.getActiveUser().usernameFixed !== "fixed" && typeof(Kinvey.getActiveUser()._socialIdentity) !== "undefined"){
			 	alert("Create a username");
				editProfileUsername.val("");
			} else {
				editProfileUsername.val(aUser.username);
			}
				editProfileEmail.val(profileUser_email);
				editProfilePassword.val(aUser.password);
				editProfileFirstName.val(aUser.first_name);;
				editProfileLastName.val(aUser.last_name);
				editProfileBio.val(profileUser_bio);

			$('#editProfile ul[data-role="listview"]').listview("refresh");

			}
			
		
	});
    //Add Event
	 postTip.on({
    /**
     * Init hook.
     */
    pageinit: function() {
		console.log("Add Tip");
		console.log(currentPlace);
		console.log(currentChannel);
		
	},
	
    /**
     * Before show hook.
     */
    pagebeforeshow: function(event) {
	//Redirect to login
	if(Kinvey.getActiveUser() == null || Kinvey.getActiveUser().username == "Guest"){
        $.mobile.changePage(login);
      }
		if(typeof(Storage) !== "undefined"){
			if(currentPlace == null){
				currentPlace = {};
				currentPlace["formattedHtml"] = localStorage.getItem("Soulodex.place.formatedHtml");	
			}
		}

		//Reset UI
		$(".placeLocation").empty();
		if($('#isEvent').val() == "true"){
			$('#isEvent').val("false")
			$('#isEvent').slider("refresh");
			$('.isEvent').toggle();
		}
		
		//Datepicker
//		$("#startDate").datepicker();
//		$("#endDate").datepicker();
		
		getChannelList();
		
		$(".placeLocation").append(currentPlace["formattedHtml"]);
     	$('.placeLocation[data-role="listview"]').listview("refresh");
		}
	 });
	 
	doc.on('click', '.saveEvent', function(e){
		addTip.submit();
	});
  //Add Place
	addPlace.on('submit',function(e){
		e.preventDefault();// Stop submit.

		var button = $(this).attr('disabled', 'disabled'),
		channelsArr = [],
		dataObj = { },
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
	addressArr = streetAddress.split(" "),
	subThoroughfare = addressArr[0],
	thoroughfare = streetAddress;
				
	dataObj["subThoroughfare"] = $.trim(subThoroughfare);
	dataObj["thoroughfare"] =  $.trim(thoroughfare.replace(subThoroughfare, ""));
	
	$.post("getGeoInfo.php",{ 
					"street" : streetAddress,
					"city": city,
					"state": state,
					"zip": zip
		}).done(function( data ) {
			latitude = parseFloat(data.Latitude);
			longitude = parseFloat(data.Longitude);
			if(longitude !== null && latitude !== null){
				dataObj["_geoloc"] = [longitude, latitude];
				console.log("Geolocation : " + dataObj["_geoloc"]);
			}
		
  }).fail(function(error) {
	  alert("Please make sure that this is a valid address and try again");
		//TODO: Add Error log or send email
		//For now flag with geocode of null
		//dataObj["_geoloc"] = null;
  }).always(function() {
		// Retrieve the form data
	 	addPlace.serializeArray().forEach(function(input) {
			if(input.name !== "channel" && input.name !== "streetAddress"  ){
				if(input.value !== "" && input.value !== null){ 
					if(input.name == "businessName"){
					dataObj[input.name] = $.trim(input.value).toUpperCase();
					} else {
						dataObj[input.name] = $.trim(input.value);	
					}
	  				console.log(input.name + " : " + $.trim(input.value)); 
				}
			}
		});
		
		$('input[type="checkbox"]:checked').serializeArray().forEach(function(checkbox){
				channelsArr.push(checkbox.value);			
			});
			
			if(channelsArr.length == 0){
					var requiredMsg = { };
					requiredMsg["name"] = 'Please select at least one channel';
					 doc.trigger('error', requiredMsg);
					return false;
			} else {
				dataObj["channels"] = channelsArr;
			}
			
			//default values
			dataObj["tipCount"] = 0;
			dataObj["eventCount"] = 0
			dataObj["addedByWebsite"] = new Boolean(true);
			dataObj["userEnteredPlace"] = new Boolean(true);
	    
			$.mobile.loading('show');

		// Add the place
    	console.log(dataObj);
		Kinvey.DataStore.save('places', dataObj).then(function() {
			  $.mobile.changePage('#feedback');
    	}, function(error) {
     		 doc.trigger('error', error);
    	}).then(function() {
		  // Restore UI.
		  $.mobile.loading('hide');
		  addPlace.trigger('reset');
		  button.removeAttr('disabled');
		  
		});
  });
});

$('#startDate').blur(function(e){
	var dateVal = $('#startDate').val();
	var pattern = new RegExp(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
	
	if(!dateVal.match(pattern)){
		var errMsg = {};
		errMsg["name"] = 'Start Date is not valid format: mm/dd/yyyy';
		doc.trigger('error', errMsg);
	   return false;
	}
	 
});

$('#endDate').blur(function(e){
	var dateVal = $('#endDate').val();
	var pattern = new RegExp(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
	
	if(!dateVal.match(pattern)){
		var errMsg = {};
		errMsg["name"] = 'End Date is not valid format: mm/dd/yyyy';
		doc.trigger('error', errMsg);
	   return false;
	}
});
$('#startTime').blur(function(e){
	var dateVal = $('#startTime').val();
	var pattern = new RegExp(/^\d{1,2}:\d{2}([ap]m)?$/);
	
	if(!dateVal.match(pattern)){
		var errMsg = {};
		errMsg["name"] = 'Start Time hh:mm AM/PM';
		doc.trigger('error', errMsg);
	   return false;
	}
});
$('#endTime').blur(function(e){
	var dateVal = $('#endTime').val();
	var pattern = new RegExp(/^\d{1,2}:\d{2}([ap]m)?$/);
	
	if(!dateVal.match(pattern)){
		var errMsg = {};
		errMsg["name"] = 'End Time hh:mm AM/PM';
		doc.trigger('error', errMsg);
	   return false;
	}
});

//To ISO String
function toISO(date,time){
	var iDate = new Date(date);
	var hoursTwoDigits = "00";
	var minsTwoDigits = "00";
	
	if(iDate != "Invalid Date"){
		var year = iDate.getUTCFullYear();
		var month = iDate.getUTCMonth() + 1;
		var date = iDate.getUTCDate();
		
		if(month < 10 && month.length == 1){
			month = '0' + month;	
		}
		if(date < 10 && date.length == 1){
			date = '0' + date;	
		}
		if(time.search("pm") != -1){
			var tmString = time.replace("pm", "");
			var tmArr = tmString.split(":");
			var hours = tmArr[0];
			var mins = tmArr[1];
			
			if(hours < 12){
				hours += 12;
			}
			if(hours < 10 && hours.length == 1){
				hoursTwoDigits = '0' + hours;	
			}
			if(mins < 10 && mins.length == 1){
				minsTwoDigits = '0' + mins;	
			}
		} else if (time.search("am") != -1){
			var tmString = time.replace("am", "");
			var tmArr = tmString.split(":");
			var hours = tmArr[0];
			var mins = tmArr[1];
			
			if(hours < 10 && hours.length == 1){
					hoursTwoDigits = '0' + hours;	
				}
			if(mins < 10 && mins.length == 1){
					minsTwoDigits = '0' + mins;	
				}
			
		} else{
			var tmArr = time.split(":");
			hoursTwoDigits = tmArr[0];
			minsTwoDigits = tmArr[1];
		}
	
	var iso = 'ISODate(\"'+ year + '-' + month + '-' + date + 'T' + hoursTwoDigits + ":" + minsTwoDigits + ':00.000Z")';
	console.log(iso);
		return  iso;

	} else {
		var errMsg = {};
		errMsg["name"] = 'Start and/or End Date is not valid format: mm/dd/yyyy hh:mm AM/PM';
		doc.trigger('error', errMsg);
	   return false;
	}
}

addTip.submit(function(e){
	e.preventDefault();// Stop submit.
	var placeChannels = localStorage.getItem("placeChannels");
	var button = $(this).attr('disabled', 'disabled');
		var dataObj = {};
		var tipChannelsArr = [];
		$.mobile.loading("show");

		// Retrieve the form data
	 	addTip.serializeArray().forEach(function(input) {
			
				if(input.value !== "" && input.name !== "endTime" && input.name !== "startTime"){ 
					if(input.name !== "channel"){
						if(input.name == "startDate" || input.name == "endDate"){							
								//var aDate = new Date(input.value);
//								if(aDate != "Invalid Date"){
//								var isoDateFormat = aDate.toISOString();
//								var stringDate = isoDateFormat.toString();
//								
//								dataObj[input.name] = 'ISODate(\"'+ stringDate + '\")';
//								console.log(input.name);
//								console.log(aDate);
//								console.log(dataObj[input.name]);
//								} else {
//									var errMsg = {};
//									errMsg["name"] = 'Start and/or End Date is not valid format: mm/dd/yyyy hh:mm AM/PM';
//									doc.trigger('error', errMsg);
//								   return false;
//								}
						} else if(input.name == "isEvent"){
							if(input.value == "true"){
								dataObj[input.name] = new Boolean(true);
								
								console.log(input.name + " : " + $.trim(input.value)); 
							} else {
								dataObj[input.name] = new Boolean(false);
								console.log(input.name + " : " + $.trim(input.value)); 
							}
						} else {
							dataObj[input.name] = $.trim(input.value);
							console.log("3 " + input.name + " : " + $.trim(input.value)); 
							
						}
					} 
				} 
		});
			var currentUser = Kinvey.getActiveUser();
			if(currentUser.username){
				dataObj["userName"] = currentUser.username;	
			}
		
		//Validation	
		if($('#eventTitle').val() == "" || $('#eventMessage').val() == ""){
			var errMsg = { };
			errMsg["name"] = 'All fields are required';
			$(document).trigger('error', errMsg);
			return false;	
		}
		if($('#isEvent').val() == "true"){	
			var startDateVal = $('#startDate').val();
			var endDateVal = $('#endDate').val();
			var startTime = $('#startTime').val();
			var endTime = $('#endTime').val();
		
			dataObj["startDate"] = toISO(startDateVal, startTime);
			dataObj["endDate"] = toISO(endDateVal, endTime);
	
		}
			//Get Channels
			$('input[type="checkbox"]:checked').serializeArray().forEach(function(checkbox){
				if(placeChannels.match(checkbox.value) == null){
					tipChannelsArr.push(checkbox.value);	
				}
			});
	
				
			//Get the place id stored in localstorage
			var placeId_LS = localStorage.getItem("Soulodex.place.current");

			dataObj["inappropriateFlag"] = new Boolean(false);

		$.mobile.loading('show');
	

		// Add the place
    	console.log(dataObj);
		Kinvey.DataStore.save('tips', dataObj).then(function(response) {
				//Increment tip/event count for class
				console.log("tip response");
				console.log(response);
				//updateTipEventCount(dataObj);
				updatePlaceTip(placeId_LS, response,tipChannelsArr);
    	}, function(error) {
     		 doc.trigger('error', error);
    	}).then(function() {
		  // Restore UI.
		  $.mobile.loading("hide");
		  addTip.trigger('reset');
		  
		});
  });
}.call(this));
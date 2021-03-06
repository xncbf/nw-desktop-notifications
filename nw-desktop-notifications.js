(function(){
	var WINDOW_WIDTH = 290;
	var counter = 0;
	window.LOCAL_NW = {};
	 
	function makeNewNotifyWindow(icon, title, content, onClick){
		// var win = nw.Window.get();
		nw.Window.open(
			'nw-desktop-notifications.html', {
			frame: false,
			width: WINDOW_WIDTH,
			height: 0,
			show: false,
			resizable: false
		}, function(win){
			win.setAlwaysOnTop(true);
			window.LOCAL_NW.DesktopNotificationsWindow = win;
			window.LOCAL_NW.DesktopNotificationsWindowIsLoaded = false;
			win.on('loaded', function(){
				win.setAlwaysOnTop = true;
				window.LOCAL_NW.DesktopNotificationsWindowIsLoaded = true;
				$(win.window.document.body).find('#closer').click(function(){
					slideOutNotificationWindow();
				});

				var continuation = function(){
					appendNotificationToWindow(icon, title, content, onClick);
					slideInNotificationWindow();
					$(window.LOCAL_NW.DesktopNotificationsWindow.window.document.body).find('#shouldstart').text('true');	
					
				};
				if(window.LOCAL_NW.DesktopNotificationsWindowIsLoaded){
					continuation();
				}
				else{
					window.LOCAL_NW.DesktopNotificationsWindow.on('loaded',continuation);
				}
				return true;
			});
		});
		
		// win.on('loaded', function(){
			// sleep(100)
			
		// });
	}

	function closeAnyOpenNotificationWindows(){
		if(window.LOCAL_NW.DesktopNotificationsWindow){
			window.LOCAL_NW.DesktopNotificationsWindow.close(true);
			window.LOCAL_NW.DesktopNotificationsWindow = null;
		}
	}

	function notify(icon, title, content, onClick){

		if(!window.LOCAL_NW.DesktopNotificationsWindow){
			makeNewNotifyWindow(icon, title, content, onClick);
		}
	}

	function makeNotificationMarkup(iconUrl, title, content, id){
		return "<li id='"+id+"'>"+
			"<div class='icon'>" +
				"<img src='"+iconUrl+"' />" +
			"</div>" +
			"<div class='title'>"+truncate(title, 35)+"</a></div>" +
			"<div class='description'>"+truncate(content, 37)+"</div>" +
			"</li>";
	}

	function appendNotificationToWindow(iconUrl, title, content, onClick){
		var elemId = getUniqueId();
		var markup = makeNotificationMarkup(iconUrl, title, content, elemId);
		var jqBody = $(window.LOCAL_NW.DesktopNotificationsWindow.window.document.body);
		jqBody.find('#notifications').append(markup);
		jqBody.find('#'+elemId).click(onClick);
	}

	function slideInNotificationWindow(){
		var win = window.LOCAL_NW.DesktopNotificationsWindow;
		if(win.NOTIFICATION_IS_SHOWING){
			
			return;
		}
		var y = screen.availTop;
		var x = WINDOW_WIDTH;
		win.moveTo(getXPositionOfNotificationWindow(win),y);
		win.show();
		win.NOTIFICATION_IS_SHOWING = true;
		if(document.hasFocus()){
			//win.blur();
		}
		function animate(){
			setTimeout(function(){
				if(y<60){
					win.resizeTo(x,y);
					y+=10;
					animate();
				}
			},5);
		}
		animate();
	}

	function slideOutNotificationWindow(callback){
		var win = window.LOCAL_NW.DesktopNotificationsWindow;
		var y = win.height;
		var x = WINDOW_WIDTH;
		function animate(){
			setTimeout(function(){
				if(y>-10){
					win.resizeTo(x,y);
					y-=10;
					animate();
				}
				else{
					win.hide();
					if(callback){
						callback();
					}
				}
			},5);
		}
		animate();
		win.NOTIFICATION_IS_SHOWING = false;
	}

	function getXPositionOfNotificationWindow(win){
		return screen.availLeft + screen.availWidth - (WINDOW_WIDTH+10);
	}

	function getUniqueId(){
		return (+(new Date())) + '-' + (counter ++);
	}

	function truncate(str, size){
		str = $.trim(str);
		if(str.length > size){
			return $.trim(str.substr(0,size))+'...';
		}
		else{
			return str;
		}
	}

	window.LOCAL_NW.desktopNotifications = {
		notify: notify,
		closeAnyOpenNotificationWindows: closeAnyOpenNotificationWindows
	};

})();

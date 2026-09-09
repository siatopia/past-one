/**
 * @author Ryan Johnson <ryan@livepipe.net>
 * @copyright 2007 LivePipe LLC
 * @package Control.Modal
 * @license MIT
 * @url http://livepipe.net/projects/control_modal/
 * @version 2.0.0.RC1
 */

if(typeof(Control) == "undefined")
	Control = {};
	
Control.Modal = Class.create();
Object.extend(Control.Modal,{
	loaded: false,
	loading: false,
	loadingTimeout: false,
	overlay: false,
	container: false,
	current: false,
	ie: false,
	effects: {
		containerFade: false,
		containerAppear: false,
		overlayFade: false,
		overlayAppear: false
	},
	targetRegexp: /#(.+)$/,
	imgRegexp: /\.(jpe?g|gif|png|tiff?)$/,
	overlayStyles: {
		position: 'absolute',
		top: 0,
		left: 0,
		zIndex: 9990
	},
	disableHoverClose: false,
	load: function(){
		if(!Control.Modal.loaded){
			Control.Modal.loaded = true;
			Control.Modal.ie = !!(window.attachEvent && !window.opera);
			Control.Modal.overlay = $(document.createElement('div'));
			Control.Modal.overlay.id = 'modal_overlay';
			Object.extend(Control.Modal.overlay.style,Control.Modal.overlayStyles);
			Control.Modal.overlay.hide();
			Control.Modal.container = $(document.createElement('div'));
			Control.Modal.container.id = 'modal_container';
			Control.Modal.container.hide();
			Control.Modal.loading = $(document.createElement('div'));
			Control.Modal.loading.id = 'modal_loading';
			Control.Modal.loading.hide();
			var body_tag = document.getElementsByTagName('body')[0];
			body_tag.appendChild(Control.Modal.overlay);
			body_tag.appendChild(Control.Modal.container);
			body_tag.appendChild(Control.Modal.loading);
			//hover handling
			Control.Modal.container.observe('mouseout',function(event){
				if(!Control.Modal.disableHoverClose && Control.Modal.current && Control.Modal.current.options.hover && !Position.within(Control.Modal.container,Event.pointerX(event),Event.pointerY(event)))
					Control.Modal.close();
			});
		}
	},
	open: function(contents,options){
		options = options || {};
		if(!options.contents)
			options.contents = contents;
		var modal_instance = new Control.Modal(false,options);
		modal_instance.open();
		return modal_instance;
	},
	close: function(){
		if(Control.Modal.current)
			Control.Modal.current.close();
	},
	attachEvents: function(){
		Event.observe(window,'load',Control.Modal.load);
		//prototype 1.6.0.3으로 버전 올리면서 발생한 오류로 인해 주석처리 
//		Event.observe(window,'unload',Event.unloadCache,false);
	},
	center: function(element){
		if(!element._absolutized){
			element.setStyle({
				position: 'absolute'
			}); 
			element._absolutized = true;
		}
		var dimensions = element.getDimensions();
		Position.prepare();
		var offset_left = (Position.deltaX + Math.floor((Control.Modal.getWindowWidth() - dimensions.width) / 2));
		var offset_top = (Position.deltaY + Math.floor((Control.Modal.getWindowHeight() - dimensions.height) / 2));
		element.setStyle({
			top: ((dimensions.height <= Control.Modal.getWindowHeight()) ? ((offset_top != null && offset_top > 0) ? offset_top : '0') + 'px' : 0),
			left: ((dimensions.width <= Control.Modal.getWindowWidth()) ? ((offset_left != null && offset_left > 0) ? offset_left : '0') + 'px' : 0)
		});
	},
	getWindowWidth: function(){
		return (self.innerWidth || document.documentElement.clientWidth || document.body.clientWidth || 0) - Control.Modal.getScrollBarWidth();
	},
	getWindowHeight: function(){
		return (self.innerHeight ||  document.documentElement.clientHeight || document.body.clientHeight || 0);
	},
	getDocumentWidth: function(){
		var _sHeight = document.body.scrollWidth;
		var _oHeight = document.documentElement.offsetWidth;
		
		if(_sHeight > _oHeight) {
			return document.body.scrollWidth;
		}else {
			return document.documentElement.offsetWidth;
		}
	},
	getDocumentHeight: function(){
		var _sHeight = document.body.scrollHeight;
		var _oHeight = document.documentElement.offsetHeight;
		
		if(_sHeight > _oHeight) {
			return document.body.scrollHeight;
		}else {
			return document.documentElement.offsetHeight;
		}
	},
	getScrollBarWidth: function(){
		var scroller_div = document.createElement('div');
		Object.extend(scroller_div.style,{
			position: 'absolute',
			top:'-1000px',
			left: '-1000px',
			width: '100px',
			height: '50px',
			overflow: 'hidden'
		});
		var inner_div = document.createElement('div');
		inner_div.style.width = '100%';
		inner_div.style.height = '200px';
		scroller_div.appendChild(inner_div);
		document.body.appendChild(scroller_div);
		var withNoScroll = inner_div.offsetWidth;
		scroller_div.style.overflow = 'auto';
		var withScroll = inner_div.offsetWidth;
		document.body.removeChild(document.body.lastChild);
		return (withNoScroll - withScroll);
	},
	onKeyDown: function(event){
		if(event.keyCode == Event.KEY_ESC)
			Control.Modal.close();
	}
});
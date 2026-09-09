/**
 * 
 */
 
if(typeof Control == 'undefined')
	throw("You require md/js/control/Control.js!!");
	
Control.Modal.openDialog = function(elm, evt, src, width, height) {
	if(Control.Modal.loaded) {
		if(typeof(this.modal) == 'undefined') {
			this.modal = new Control.Modal();
		}
		this.modal.open(elm, src, width, height);	
	}
	
//	if(evt) {
//		Event.stop(evt);
//	}
	return false;
};


Control.Modal.center = function(element) {
	var DEFAULT_PADDING = 30;
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
	
	var getTop = function(dimensions, offset_top){
		if(dimensions.height <= Control.Modal.getWindowHeight() 
				&& (offset_top != null && offset_top > 0)) {
			return offset_top +'px'; 
		}
		return (Position.deltaY +DEFAULT_PADDING) +'px';
	}
	
	var getLeft = function(dimensions, offset_left) {
		if(dimensions.width <= Control.Modal.getWindowWidth() 
				&& (offset_left != null && offset_left > 0)) {
			return offset_left +'px';
		}
		return (Position.deltaX +DEFAULT_PADDING) +'px';
	}
	
	element.setStyle({
		top: getTop(dimensions, offset_top),
		left: getLeft(dimensions, offset_left)
	});
};


Object.extend(Control.Modal.prototype,{
	html: false,
	element: false,
	initialize: function(){
		this.options = {
			template: new Template(
				'<div style="padding:3px 3px 3px 3px; margin:0;">' +
					'<img src="#{src}" id="#{id}" style="cursor:pointer;" title="이미지를 클릭하시면 창이 닫힙니다."/>' +
				'</div>'),
			containerClassName: 'popup_image',
			overlayClassName: 'popup_overlay',
			opacity: 0.6,
			zIndex: 9990
		};
		this.container = new Control.Container(Control.Modal.container, this.options);
		this.overlay = new Control.Overlay(Control.Modal.overlay, this.options);
		
		this.position = function() {
			var dimensions = this.container.getDimensions();
			this.overlay.position(dimensions);
			this.container.center();
		}.bind(this);
	},
	
	open: function(element, src, width, height){
		if(!Control.Modal.loaded) {
			Control.Modal.load();
		}
		Control.Modal.close();

		this.workaround(false);
		this.element = $(element);
		Control.Modal.current = this;
		Event.observe(document, 'keydown',Control.Modal.onKeyDown);

		this.update(this.options.template.evaluate({
			'src': src,
			id: 'modal_image'
		}));
		this.container.open(width, height);
		this.overlay.open();
		this.position();
	},
	
	update: function(html){
		this.container.update(html);
		this.position();
	},
	
	close: function(){
		Control.Modal.current = false;
		Event.stopObserving(window,'keyup',Control.Modal.onKeyDown);
		this.workaround(true);
		
		this.overlay.close();
		this.container.close();
	},
	
	workaround: function(isVisible) {
		var handleVisible = function(_tagName, _isVisible){
			$A(document.getElementsByTagName(_tagName)).each(function(tag){
				tag.style.visibility = _isVisible? 'visible': 'hidden';
			});			
		}
		
		if(Control.Modal.ie){ 
			handleVisible("select", isVisible);
		}
		handleVisible("object", isVisible);
		handleVisible("iframe", isVisible);
		handleVisible("embed", isVisible);
	}
});


Control.Container = Class.create();
Object.extend(Control.Container.prototype, {
	PADDING_HEIGHT: 6,
	PADDING_WIDTH: 6,
	
	initialize: function(element, options) {
		this.TITLE_HEIGHT = 21;
		
		this.element = element;
		this.zIndex = options.zIndex;
		this.className = options.containerClassName;
	}, 
	
	open: function(width, height) {
		var img = $('modal_image');
		Event.observe(img, 'click', Control.Modal.close);
		this.element.setStyle({
			zIndex: this.zIndex + 1,
			width: (width == null? img.getWidth(): parseInt(width)) +this.PADDING_WIDTH +'px',
			height: (height == null? img.getHeight(): parseInt(height)) +this.PADDING_HEIGHT +'px'
		});
		this.element.addClassName(this.className);
		this.center();		
	}, 
	
	update: function(html) {
		Element.update(this.element, html);
		Element.show(this.element);				
	},
	
	close: function() {
		Event.stopObserving($('modal_image'), 'click',Control.Modal.close);
		this.element.hide();
		this.element.update('');	
		
		this.element.removeClassName(this.className);
		this.element.setStyle({
			height: null,
			width: null,
			top: null,
			left: null
		});		
	}, 
	
	center: function() {
		Control.Modal.center(this.element);	
	}, 
	
	getDimensions: function() {
		return Element.getDimensions(this.element);
	}
});


Control.Overlay = Class.create();
Object.extend(Control.Overlay.prototype, {
	initialize: function(element, options) {
		this.element = element;
		this.zIndex = options.zIndex;
		this.opacity = options.opacity;
		this.className = options.overlayClassName;
	}, 
	
	open: function() {
		Event.observe(this.element, 'click', Control.Modal.close);
		this.element.setStyle({
			zIndex: this.zIndex, 
			opacity: this.opacity
		});		
		this.element.addClassName(this.className);
		this.element.show();
	}, 
	
	close: function() {
		Event.stopObserving(this.element, 'click',Control.Modal.close);
		
		this.element.hide();	
		this.element.removeClassName(this.className);		
	}, 

	position: function(dimensions) {
		var getWidth = function(imgWidth) {
			var _width = Control.Modal.getDocumentWidth();
			if(_width < imgWidth +60) {
				return imgWidth +60;
			}else {
				return _width;
			}
		}
		var getHeight = function(imgHeight) {
			Position.prepare();
			var _height = Control.Modal.getDocumentHeight();
			if(_height < Position.deltaY +imgHeight +60) {
				return Position.deltaY +imgHeight +60;
			}else {
				return _height;
			}
		}
		
		Element.setStyle(this.element, {
			height: getHeight(dimensions.height) + 'px',
			width: getWidth(dimensions.width) + 'px'
		});
	}
});


if(typeof(Object.Event) != 'undefined')
	Object.Event.extend(Control.Modal);
Control.Modal.attachEvents();
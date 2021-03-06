/**
 * Copyright (C) 2009 eXo Platform SAS.
 * 
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 * 
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */

/**
 * Manages the mask layer component
 */
function UIMaskLayer() {
} ;
/**
 * Creates a transparent mask with "wait" cursor type
 */
 /*
UIMaskLayer.prototype.createTransparentMask = function() {
	var mask = document.getElementById("TransparentMaskLayer");
	if (!mask) {
		mask = document.createElement("div");
		mask.id = "TransparentMaskLayer";
		mask.style.top = "0px" ;
		mask.style.left = "0px" ;
		eXo.core.Browser.setOpacity(mask, 0);
		mask.style.backgroundColor = "white";
		mask.style.zIndex = "2" ;
		mask.style.position = "absolute";
		mask.style.cursor = "wait";
		mask.style.display = "block";
		document.getElementsByTagName("body")[0].appendChild(mask);
	}
	mask.style.width = "100%" ;
	mask.style.height = "100%" ;
};
*/
UIMaskLayer.prototype.createTransparentMask = function() {
	var Browser = eXo.core.Browser ;
	var ajaxLoading = document.getElementById("AjaxLoadingMask") ;
	var maskLayer = eXo.core.UIMaskLayer.createMask("UIPortalApplication", ajaxLoading, 0) ;
	Browser.addOnScrollCallback("5439383", eXo.core.UIMaskLayer.setPosition) ;
							
	ajaxLoading.style.display = "none";
	Browser.setOpacity(maskLayer,0);
	maskLayer.style.backgroundColor = "white";
	maskLayer.style.cursor = "wait";
	
	return maskLayer;
};

/*
 * Display ajax loading and set opacity for mask layer
 */
UIMaskLayer.prototype.showAjaxLoading = function(mask){
	var ajaxLoading = document.getElementById("AjaxLoadingMask");
	ajaxLoading.style.display = "block";
	eXo.core.Browser.setOpacity(mask,30);
	mask.style.backgroundColor = "black";	
}
 
/**
 * Hides the transparent mask
 * To avoid some bugs doesn't "really" hides it, only reduces its size to 0x0 px
 */
UIMaskLayer.prototype.removeTransparentMask = function() {
	var mask = document.getElementById("TransparentMaskLayer");
	if (mask) {
		mask.style.height = "0px" ;
		mask.style.width = "0px" ;
	}
};
/**
 * Removes both transparent and loading masks
 */
UIMaskLayer.prototype.removeMasks = function(maskLayer) {
	eXo.core.UIMaskLayer.removeTransparentMask();
	eXo.core.UIMaskLayer.removeMask(maskLayer) ;
};


/**
 * Creates and returns the dom element that contains the mask layer, with these parameters
 *  . the mask layer is a child of blockContainerId
 *  . object
 *  . the opacity in %
 *  . the position between : TOP-LEFT, TOP-RIGHT, BOTTOM-LEFT, BOTTOM-RIGHT, other value will position to center
 * The returned element has the following html attributes :
 *  . className = "MaskLayer" ;
 *	. id = "MaskLayer" ;
 *	.	style.display = "block" ;
 *	. maxZIndex = 2 ;
 *	.	style.zIndex = maskLayer.maxZIndex ;
 *	.	style.top = "0px" ;
 *	.	style.left = "0px" ;
 */
UIMaskLayer.prototype.createMask = function(blockContainerId, object, opacity, position) {
	try {
		var Browser = eXo.core.Browser ;
		if(typeof(blockContainerId) == "string") blockContainerId = document.getElementById(blockContainerId) ;
		var blockContainer = blockContainerId ;
		var maskLayer = document.createElement("div") ;
		
		this.object = object ;
		this.blockContainer = blockContainer ;
		this.position = position ;
		
		if (document.getElementById("MaskLayer")) {
			/*
			 * minh.js.exo
			 * fix for double id : MaskLayer
			 * reference with method eXo.core.UIMaskLayer.doScroll()
			 */
			document.getElementById("MaskLayer").id = "subMaskLayer";
		} 
		blockContainer.appendChild(maskLayer) ;		
		maskLayer.className = "MaskLayer" ;
		maskLayer.id = "MaskLayer" ;		
		maskLayer.maxZIndex = eXo.webui.UIPopup.zIndex + 1; //3 ;
		maskLayer.style.width = Browser.getBrowserWidth() + "px";
		maskLayer.style.height = Browser.getBrowserHeight() + "px";
		maskLayer.style.top = "0px" ;
		maskLayer.style.left = "0px" ;
		maskLayer.style.zIndex = maskLayer.maxZIndex ;

		if(opacity) {
	    	Browser.setOpacity(maskLayer, opacity) ;
		}
																		
		if(object != null) {
			var tempNextSibling = document.createElement("span");
			if(object.nextSibling) {				
				object.parentNode.insertBefore(tempNextSibling, object.nextSibling);			  			
			} else {
				object.parentNode.appendChild(tempNextSibling);
			}
			maskLayer.nextSiblingOfObject = tempNextSibling ;
			
			//object.style.zIndex = maskLayer.maxZIndex + 1 ;
			object.style.zIndex = maskLayer.maxZIndex;			
			object.style.display = "block" ;
			
			blockContainer.appendChild(object) ;
		
			eXo.core.UIMaskLayer.setPosition() ;
			if(eXo.core.I18n.isLT()) {
				if((blockContainer.offsetWidth > object.offsetLeft + object.offsetWidth) && (position == "TOP-RIGHT") || (position == "BOTTOM-RIGHT")) {
			    object.style.left = blockContainer.offsetWidth - object.offsetWidth + "px" ;
				}
			}
			eXo.core.UIMaskLayer.doScroll() ;
	  }
		if(maskLayer.parentNode.id == "UIPage") {
			eXo.core.UIMaskLayer.enablePageDesktop(false);
	  }
	}catch(err) {
		alert(err) ;
	}
	Browser.addOnResizeCallback(maskLayer.id, eXo.core.UIMaskLayer.resizeMaskLayer);
	return maskLayer ;
};

/*
 * Tung.Pham added
 */
//TODO: Temporary use
UIMaskLayer.prototype.createMaskForFrame = function(blockContainerId, object, opacity) {
	try {
		var Browser = eXo.core.Browser ;
		if(typeof(blockContainerId) == "string") blockContainerId = document.getElementById(blockContainerId) ;
		var blockContainer = blockContainerId ;
		var maskLayer = document.createElement("div") ;
		blockContainer.appendChild(maskLayer) ;
		maskLayer.className = "MaskLayer" ;
		maskLayer.id = object.id + "MaskLayer" ;
		maskLayer.maxZIndex = 3 ;
		maskLayer.style.width = blockContainer.offsetWidth + "px"  ;
		maskLayer.style.height =  blockContainer.offsetHeight + "px"  ;
		var parentOfBlockContainer = eXo.core.DOMUtil.findAncestorById(blockContainer, "UIMaskWorkspace");
		if (!parentOfBlockContainer) {
			parentOfBlockContainer = document.getElementById("UIWorkingWorkspace");
		}
		maskLayer.style.top = eXo.core.Browser.findPosYInContainer(blockContainer, parentOfBlockContainer) + "px" ;
		maskLayer.style.left = eXo.core.Browser.findPosXInContainer(blockContainer, parentOfBlockContainer) + "px" ;		
		maskLayer.style.zIndex = maskLayer.maxZIndex ;
		if(opacity) {
	    Browser.setOpacity(maskLayer, opacity) ;
		}
		
		if(object != null){
			var tempNextSibling = document.createElement("span");
			if(object.nextSibling) {				
				object.parentNode.insertBefore(tempNextSibling, object.nextSibling);			  			
			} else {
				object.parentNode.appendChild(tempNextSibling);
			}
			maskLayer.nextSiblingOfObject = tempNextSibling ;
			
			object.style.zIndex = maskLayer.maxZIndex + 1 ;
			object.style.display = "block" ;
				
			blockContainer.appendChild(object) ;
	  }
		
	}catch(err) {}
	return maskLayer ;
} ;

/**
 * Moves the position of the mask layer to follow a scroll
 */
 
UIMaskLayer.prototype.doScroll = function() {
	if(document.getElementById("MaskLayer")) {
		var maskLayer = document.getElementById("MaskLayer") ;
		if(document.documentElement && document.documentElement.scrollTop) {
		  maskLayer.style.top = document.documentElement.scrollTop + "px" ;
		} else {
			maskLayer.style.top = document.body.scrollTop + "px" ;
		}
		setTimeout("eXo.core.UIMaskLayer.doScroll()", 1) ;
	} else if (document.getElementById("subMaskLayer")) {
		var subMaskLayer = document.getElementById("subMaskLayer") ;
		subMaskLayer.id = "MaskLayer" ;
		eXo.core.UIMaskLayer.doScroll() ;
	}
};

/**
 * Set the position of the mask layer, depending on the position attribute of UIMaskLayer
 * position is between : TOP-LEFT, TOP-RIGHT, BOTTOM-LEFT, BOTTOM-RIGHT, other value will position to center
 */
UIMaskLayer.prototype.setPosition = function() {
	var UIMaskLayer = eXo.core.UIMaskLayer ;
	var Browser = eXo.core.Browser ;
	var object = UIMaskLayer.object ;
	var blockContainer = UIMaskLayer.blockContainer ;
	var position = UIMaskLayer.position ;
	object.style.position = "absolute" ;
	
	var left ;
	var top ;
	var topPos ;
	if (document.documentElement && document.documentElement.scrollTop) { 
		topPos = document.documentElement.scrollTop ;
	} else {
		topPos = document.body.scrollTop ;
	}
	if (position == "TOP-LEFT") {
	  left = 0 ;
	  top = 0 ;
	} else if (position == "TOP-RIGHT") {
		return ;
	} else if (position == "BOTTOM-LEFT") {
	  left = 0 ;
	  top = Browser.getBrowserHeight() - object.offsetHeight + topPos ;
	} else if (position == "BOTTOM-RIGHT") {
	  left = blockContainer.offsetWidth - object.offsetWidth ;
	  top = Browser.getBrowserHeight() - object.offsetHeight + topPos ;
	} else {
	  left = (blockContainer.offsetWidth - object.offsetWidth) / 2 ;
	  top = (Browser.getBrowserHeight() - object.offsetHeight) / 2 +  topPos ;
	}
	
	object.style.left = left + "px" ;
	object.style.top = top + "px" ;
} ;
/**
 * Removes the mask layer from the DOM
 */
UIMaskLayer.prototype.removeMask = function(maskLayer) {
	if (maskLayer) {
	  var parentNode = maskLayer.parentNode ;
	  maskLayer.nextSibling.style.display = "none" ;
	  
	  maskLayer.nextSiblingOfObject.parentNode.insertBefore(maskLayer.nextSibling, maskLayer.nextSiblingOfObject) ;
  	maskLayer.nextSiblingOfObject.parentNode.removeChild(maskLayer.nextSiblingOfObject);
  	
  	maskLayer.nextSiblingOfObject = null ;
  	parentNode.removeChild(maskLayer) ;  	
	}
} ;

/*
 * Added by Tan Pham
 * Fix for bug : In FF3, can action on dockbar when edit node
 */
UIMaskLayer.prototype.enablePageDesktop = function(enabled) {
	var pageDesktop = document.getElementById("UIPageDesktop");
	if(pageDesktop) {
		if(enabled) {
			pageDesktop.style.zIndex = "";
		} else {
			pageDesktop.style.zIndex = "-1";
		}
	}
};

UIMaskLayer.prototype.resizeMaskLayer = function() {
	var maskLayer = document.getElementById("MaskLayer");
	if (maskLayer) {
		maskLayer.style.width = eXo.core.Browser.getBrowserWidth() + "px";
		maskLayer.style.height = eXo.core.Browser.getBrowserHeight() + "px";
	}
};

eXo.core.UIMaskLayer = new UIMaskLayer() ;

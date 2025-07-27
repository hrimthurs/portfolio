THREE.DragControls = function ( _objects, _camera, _domElement ) {

	if ( _objects instanceof THREE.Camera ) 
	{
		console.warn( 'THREE.DragControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;
	}

	var prevThetaZ;
	
	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var _selected = null, _hovered = null;

	//

	var scope = this;

	var previousMousePosition = { x: 0, y: 0 };

	var SelObjName='';
	
	function activate() 
	{
		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );
	}

	function deactivate() 
	{
		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );
	}

	function dispose() 
	{
		deactivate();
	}

function ThetaZfromRay(AxeName)
{	
	var theta=0;
	
	_raycaster.setFromCamera(_mouse,_camera);				
	_raycaster.ray.applyMatrix4(new THREE.Matrix4().getInverse(RAxes[AxeName]['pivot'].matrixWorld));		
		
	//if (_raycaster.ray.direction.z < (-0.995)) { _raycaster.ray.direction.setZ(-0.995); }
	//if (_raycaster.ray.direction.z > 0.995) { _raycaster.ray.direction.setZ(0.995); }		
	
	var v=new THREE.Vector3(_raycaster.ray.direction.x,_raycaster.ray.direction.y,_raycaster.ray.direction.z);
	
	if (v.length() !== 0) { theta=Math.atan2( v.x, v.y ); } 
	
	return theta;
}


function RotateRAxeTheta(AxeName, th)
{
	var res=(AxeName != '');
	
	if (res)
	{
		var min_ang, max_ang;
		
		var f_min_ang=((CfgGetVal_str(RAxes[AxeName],'MinAng','unlim') != 'unlim') && (CfgGetVal_str(RAxes[AxeName],'MinAng','') != ''));
		var f_max_ang=((CfgGetVal_str(RAxes[AxeName],'MaxAng','unlim') != 'unlim') && (CfgGetVal_str(RAxes[AxeName],'MaxAng','') != ''));
		
		if (f_min_ang) { min_ang=toRadians(CfgGetVal_num(RAxes[AxeName],'MinAng',0)); } else { min_ang=-(Math.PI*2); }
		if (f_max_ang) { max_ang=toRadians(CfgGetVal_num(RAxes[AxeName],'MaxAng',0)); } else { max_ang=(Math.PI*2); }
		
		var ang=RAxes[AxeName]['pivot'].rotation.z+(th-prevThetaZ);						
		
		if (f_min_ang && (ang < min_ang)) { ang=min_ang; }
		if (f_max_ang && (ang > max_ang)) { ang=max_ang; }			
		
		if (ang > (Math.PI*2)) { ang=ang-(Math.PI*2); }
		if (ang < (-Math.PI*2)) { ang=ang+(Math.PI*2); }
			
		RAxes[AxeName]['pivot'].rotation.z=ang;
		prevThetaZ=th;	

		if (isDebugMode()) { document.getElementById('dbgSelObj_RAng').innerHTML=toDegrees(RAxes[AxeName]['pivot'].rotation.z).toFixed(2)+'&deg'; }		
		
//			var deltaRotationQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(toRadians(deltaMove.y * 1),toRadians(deltaMove.x * 1),0,'XYZ'));					
//			_selected.quaternion.multiplyQuaternions(deltaRotationQuaternion, _selected.quaternion);
	}
	
	return res;
}


/*
function RotateRAxeTheta(AxeName, th)
{
	var res=(AxeName != '');
	
	if (res)
	{
		var min_ang, max_ang;
		
		var f_min_unlim=(CfgGetVal_str(RAxes[AxeName],'MinAng','unlim') == 'unlim');
		var f_max_unlim=(CfgGetVal_str(RAxes[AxeName],'MaxAng','unlim') == 'unlim');
		
		if (!f_min_unlim) { min_ang=toRadians(CfgGetVal_num(RAxes[AxeName],'MinAng',-365)); }
		if (!f_max_unlim) { max_ang=toRadians(CfgGetVal_num(RAxes[AxeName],'MaxAng',365)); }
		
		//if (CfgGetVal_str(RAxes[AxeName],'MinAng','unlim') != 'unlim') { min_ang=toRadians(CfgGetVal_num(RAxes[AxeName],'MinAng',-365)); } else { min_ang=-Math.PI*2; }
		//if (CfgGetVal_str(RAxes[AxeName],'MaxAng','unlim') != 'unlim') { max_ang=toRadians(CfgGetVal_num(RAxes[AxeName],'MaxAng',365)); } else { max_ang=Math.PI*2; }
		
		var d_th=th-prevThetaZ;

		var ang=RAxes[AxeName]['pivot'].rotation.z+d_th;		
		
		if (((f_min_unlim) || (ang >= min_ang)) && ((f_max_unlim) || (ang <= max_ang)))
		{
			RAxes[AxeName]['pivot'].rotation.z=ang; 
			prevThetaZ=th;		
		}
		
		if (isDebugMode()) 
		{ 
			document.getElementById('dbgSelObj_RAng').innerHTML=toDegrees(RAxes[AxeName]['pivot'].rotation.z).toFixed(2)+'&deg'; 
			
			var v=new THREE.Vector3(_raycaster.ray.direction.x,_raycaster.ray.direction.y,_raycaster.ray.direction.z);
			var d=v.distanceTo(new THREE.Vector3(0,0,0));
			inf(AxeName+' ang:'+toDegrees(RAxes[AxeName]['pivot'].rotation.z).toFixed(3));
		}		
		
	}
	
	return res;
}*/

function ProcessingDrag(event)
{
	if (SelObjName !='')  
	{
		//Move OBJECT				_selected.position.copy( _intersection.sub( _offset ) );		
		//var deltaMove = { x: event.offsetX-previousMousePosition.x, y: event.offsetY-previousMousePosition.y };	
		
		//Rotate RAxe		
		var AxeName=CfgGetVal_str(SceneOBJ[_selected.name],'RAxe','');
		RotateRAxeTheta(AxeName,ThetaZfromRay(AxeName));							
		
		previousMousePosition = { x: event.offsetX, y: event.offsetY };						
	}				
}		  
	
function SetEmissiveByRAxe(obj_name, emiss_val)
{	
	var SelRAxeName=CfgGetVal_str(SceneOBJ[obj_name],'RAxe','');
	for (var i in SceneOBJ)
		if (CfgGetVal_str(SceneOBJ[i],'RAxe','') == SelRAxeName) { SetMaterialsEmissive(i,emiss_val); }
}
	
function ProcessingHoverOn(object)
{
	if ((SelObjName != object.name) && (SelObjName !='')) { SetEmissiveByRAxe(SelObjName,0); }
	SetEmissiveByRAxe(object.name,DragEmissiveColor);
	SelObjName=object.name;
	
	if (isDebugMode()) 
	{ 
		var AxeName=CfgGetVal_str(SceneOBJ[SelObjName],'RAxe','');
		document.getElementById('dbgSelObj_contain').style.visibility='visible';
		document.getElementById('dbgSelObj_Name').innerHTML=SelObjName;	
		document.getElementById('dbgSelObj_RAxe').innerHTML=AxeName;	
		document.getElementById('dbgSelObj_RAng').innerHTML=toDegrees(RAxes[AxeName]['pivot'].rotation.z).toFixed(2)+'&deg';			

		var min_ang=CfgGetVal_str(RAxes[AxeName],'MinAng','unlim');
		if (min_ang != 'unlim') { min_ang=CfgGetVal_num(RAxes[AxeName],'MinAng',0).toFixed(2)+'&deg'; }
		document.getElementById('dbgSelObj_RMinAng').innerHTML=min_ang;	
		
		var max_ang=CfgGetVal_str(RAxes[AxeName],'MaxAng','unlim');
		if (min_ang != 'unlim') { max_ang=CfgGetVal_num(RAxes[AxeName],'MaxAng',0).toFixed(2)+'&deg'; }
		document.getElementById('dbgSelObj_RMaxAng').innerHTML=max_ang;	
	}
}

function ProcessingHoverOff()
{
	if (SelObjName !='') 
	{ 
		SetEmissiveByRAxe(SelObjName,0); 
		SelObjName='';	
		
		if (isDebugMode()) { document.getElementById('dbgSelObj_contain').style.visibility='hidden'; }		
	}				
}

function ProcessingBeginDrag(event)
{
	if (SelObjName !='') 
	{ 
		previousMousePosition = { x: event.offsetX, y: event.offsetY };
		prevThetaZ=ThetaZfromRay(CfgGetVal_str(SceneOBJ[SelObjName],'RAxe',''));	
	}
}
	  
	function onDocumentMouseMove(event) 
	{
		event.preventDefault();

		var rect=_domElement.getBoundingClientRect();

		_mouse.x=((event.clientX-rect.left)/rect.width)*2-1;
		_mouse.y=-((event.clientY-rect.top)/rect.height)*2+1;

		if (_selected && scope.enabled) 
		{
			if (_raycaster.ray.intersectPlane(_plane,_intersection)) { ProcessingDrag(event); }
			scope.dispatchEvent({type:'drag',object:_selected});
			return;
		}

		_raycaster.setFromCamera(_mouse,_camera);  //?

		var intersects=_raycaster.intersectObjects( _objects );
		
		if (intersects.length > 0) 
		{
			var object=intersects[0].object;

			_plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal),object.position);

			if (_hovered !== object) 
			{				
				ProcessingHoverOn(object);				
				scope.dispatchEvent({type:'hoveron',object:object});
				_domElement.style.cursor='pointer';
				_hovered=object;
			} 
		} else 
		{		
			if (_hovered !== null) 
			{				
				ProcessingHoverOff();
				scope.dispatchEvent({type:'hoveroff',object:_hovered});
				_domElement.style.cursor = 'auto';
				_hovered = null;
			}
		}

	}

	function onDocumentMouseDown(event) 
	{
		event.preventDefault();
		_raycaster.setFromCamera(_mouse,_camera);

		var intersects=_raycaster.intersectObjects( _objects );

		if (intersects.length>0) 
		{
			_selected=intersects[0].object;

			if (_raycaster.ray.intersectPlane(_plane,_intersection)) { _offset.copy( _intersection ).sub( _selected.position );}
			
			ProcessingBeginDrag(event);				
			//_domElement.style.cursor = 'move';
			scope.dispatchEvent({type:'dragstart',object:_selected});
		} 
	}

	function onDocumentMouseCancel(event) 	
	{
		event.preventDefault();
		if (_selected) 
		{		
			scope.dispatchEvent({type:'dragend',object:_selected});
			_selected=null;
		}		
	}

	function onDocumentTouchMove( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _selected && scope.enabled ) 
		{
			if (_raycaster.ray.intersectPlane(_plane,_intersection)) { ProcessingDrag(event); }
			scope.dispatchEvent({type:'drag',object:_selected});
			return;
		}

	}

	function onDocumentTouchStart( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( _objects );

		if ( intersects.length > 0 ) {

			_selected = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _selected.position );

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) 
			{
				_offset.copy( _intersection ).sub( _selected.position );				
			}

			ProcessingHoverOn(_selected);
			ProcessingBeginDrag(event);
			
			scope.dispatchEvent( { type: 'dragstart', object: _selected } );
		}
	}

	function onDocumentTouchEnd(event) 
	{
		event.preventDefault();

		if (_selected) 
		{
			scope.dispatchEvent({type:'dragend',object:_selected});
			_selected=null;
			ProcessingHoverOff();
		}
	}
	
	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

	this.on = function ( type, listener ) {

		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.dispatchEvent( { type: type } );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;

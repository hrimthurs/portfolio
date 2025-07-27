THREE.SelectControls = function ( _objects, _camera, _domElement )
{
	if ( _objects instanceof THREE.Camera )
	{
		console.warn( 'THREE.SelectControls: Constructor now expects ( objects, camera, domElement )' );
		var temp = _objects; _objects = _camera; _camera = temp;
	}

	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();

	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();

	var _selected = null, _hovered = null;

	//

	var scope = this;

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


	function ProcessingSelect(event)
	{
		if (SelObjName !='')
		{
		}
	}

	function ProcessingHoverOn(object,ev)
	{
		//if (controls.getState() == -1)
		//{
			if ((SelObjName != object.name) && (SelObjName !='')) { SetMaterialsEmissive(SelObjName,0); };
			SetMaterialsEmissive(object.name,SelectEmissiveColor);
			SelObjName=object.name;
			SetClickOnObject(ev);

			//document.getElementById('ClickToURL').style.display='block';
		//}
	}

	function ProcessingHoverOff(ev)
	{
		if (SelObjName !='')
		{
			SetMaterialsEmissive(SelObjName,0);
			SelObjName='';
			SetClickOnObject(ev);
		}
	}

	function SetClickOnObject(event)
	{
		if (SelObjName != '')
		{
			click_action=CfgGetVal_str(SceneOBJ[SelObjName],'onclick','').split('>');

			switch (click_action[0].toLowerCase())
			{
				case 'url':
					var elToUrl=document.getElementById('ClickToURL');
					elToUrl.style.display='block';
					elToUrl.style.left = (event.clientX-1)+'px';
					elToUrl.style.top = (event.clientY-1)+'px';
					elToUrl.innerHTML = self.location.origin + self.location.pathname + '?model=' + click_action[1];

					elToUrl.onclick= function(e) { window.open(this.innerHTML,'_blank'); }
					break;
			}
		} else
		{
			document.getElementById('ClickToURL').style.display='none';
			document.getElementById('ClickToURL').onclick = function(e) {}
		}
	}

	function onDocumentMouseMove(event)
	{
		SetClickOnObject(event);

		event.preventDefault();

		var rect=_domElement.getBoundingClientRect();

		_mouse.x=((event.clientX-rect.left)/rect.width)*2-1;
		_mouse.y=-((event.clientY-rect.top)/rect.height)*2+1;

		if (_selected && scope.enabled)
		{
			if (_raycaster.ray.intersectPlane(_plane,_intersection)) { ProcessingSelect(event); }
			scope.dispatchEvent({type:'select',object:_selected});
			return;
		}

		_raycaster.setFromCamera(_mouse,_camera);  //?

		var intersects=_raycaster.intersectObjects( _objects );

		if (intersects.length > 0)
		{
			var object=intersects[0].object;

			_plane.setFromNormalAndCoplanarPoint(_camera.getWorldDirection(_plane.normal),object.position);

			if ((_hovered !== object) && (controls.getState() == -1))
			{
				ProcessingHoverOn(object,event);
				scope.dispatchEvent({type:'hoveron',object:object});
				_domElement.style.cursor='pointer';
				_hovered=object;
			}
		} else
		{
			if (_hovered !== null)
			{
				ProcessingHoverOff(event);
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

			//_domElement.style.cursor = 'move';
			scope.dispatchEvent({type:'selectstart',object:_selected});
		}
	}

	function onDocumentMouseCancel(event)
	{
		event.preventDefault();
		if (_selected)
		{
			scope.dispatchEvent({type:'selectend',object:_selected});
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
			if (_raycaster.ray.intersectPlane(_plane,_intersection)) { ProcessingSelect(event); }
			scope.dispatchEvent({type:'select',object:_selected});
			return;
		}

	}

	function onDocumentTouchStart( event )
	{
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

			ProcessingHoverOn(_selected,event);

			scope.dispatchEvent( { type: 'selectstart', object: _selected } );
		}
	}

	function onDocumentTouchEnd(event)
	{
		event.preventDefault();

		if (_selected)
		{
			scope.dispatchEvent({type:'selectend',object:_selected});
			_selected=null;
			ProcessingHoverOff(event);
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

		console.error( 'THREE.SelectControls: setObjects() has been removed.' );

	};

	this.on = function ( type, listener ) {

		console.warn( 'THREE.SelectControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.SelectControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.SelectControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.dispatchEvent( { type: type } );

	};

};

THREE.SelectControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.SelectControls.prototype.constructor = THREE.SelectControls;

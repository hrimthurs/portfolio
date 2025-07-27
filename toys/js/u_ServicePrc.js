function toRadians(angle) {	return angle * (Math.PI / 180); }
function toDegrees(angle) {	return angle * (180 / Math.PI); }

function m (mess)
{
	var out_text='!';
	if (mess != undefined) out_text=mess;
	alert(out_text);
}

function inf (mess)
{
	document.getElementById('inf').innerHTML = mess;
}

function isNumeric (n)
{
	return !isNaN(parseFloat(n));
}

function UrlGetValue (get_name)
{
	var params = window
		.location
		.search
		.replace('?','')
		.split('&')
		.reduce(
			function(p,e)
			{
				var a = e.split('=');
				p[ decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
				return p;
			},
			{}
		);

	if (get_name in params) { return params[get_name]; } else { return '';}
}

function webglAvailable()
{
	try
	{
		var canvas = document.createElement("canvas");
		return !!
			window.WebGLRenderingContext &&
			(canvas.getContext("webgl") ||
				canvas.getContext("experimental-webgl"));
	} catch(e)
	{
		return false;
	}
}

function OutError (err_message)
{
	document.body.style.backgroundColor = '#aaaaaa';
	document.getElementById('notice_img').style.backgroundImage = "url('"+ImagesPath+imgNoticeErr+"')";
	document.getElementById('notice_msg').innerHTML = err_message;
	//document.getElementById('notice_contain').style.display = 'table';
}

function PrepareInterfaceLoading (path_model)
{
	document.getElementById('notice_img').style.backgroundImage = "url('"+ImagesPath+imgLoadingAnm+"')";
	document.getElementById('notice_msg').innerHTML = 'LOADING';
	//document.getElementById('notice_contain').style.display = 'table';
	//document.getElementById('cover_contain').style.display = 'block';

	bg_loading=UrlGetValue('bg_load');

	if ((bg_loading != undefined) && (bg_loading != ''))
	{
		if (bg_loading != 'off')
		{
			document.getElementById('cover').style.backgroundImage="url('"+ModelsPath+model+"/"+bg_loading+"')";
		}
	} else
	{
		var def_img_name=ModelsPath+model+"/"+bgImgLoadingDef;
		var loader = new THREE.FileLoader();
		loader.load(def_img_name, function (data) { document.getElementById('cover').style.backgroundImage='url("'+def_img_name+'")'; }, function (xhr) {},	function (err) { document.getElementById('cover').style.backgroundImage='url("'+ImagesPath+bgImgLoading+'")'; });
	}

}

function ShowInformation()
{
//	alert('Information');
  //SceneOBJ['Leviathan1']['mesh'].position.y=80; SceneOBJ['Leviathan2']['mesh'].rotation.y=Math.PI/5; SceneOBJ['Leviathan5']['mesh'].visible=false;
 // SetScene('Battle');
	//document.getElementById('CurrSubScene').innerHTML='Battle';
}

function CreateMenu ()
{
	if (isDebugMode())
	{
		AddMenuItem('itmScrSht','E','ScreenShot()');
		AddMenuItem('itmResScn','p','ResetScene()');
	} else
	{
		//AddMenuItem('itmHelp','C');
		if (THREEx.FullScreen.available())
		{
			THREEx.FullScreen.bindKey({	dblclick:true });

			var elBtn = document.getElementById('btn_full_screen')
			elBtn.addEventListener('click', () => ChangeFullScr())
			// AddMenuItem('itmFullScr','h','ChangeFullScr()');
		}

		//AddMenuItem('itmInform','f','ShowInformation()');
		//AddMenuItem('itmPlay','n','');
	}
}

function SetMaterialsEmissive(ModelName, emiss_val)
{
	if ( SceneOBJ[ModelName]['materials'].length > 1 )
	{
		for ( var i=0; i < SceneOBJ[ModelName]['materials'].length; i++ ) { SceneOBJ[ModelName]['materials'][i].emissive.setHex( emiss_val ); }
	} else SceneOBJ[ModelName]['materials'][0].emissive.setHex( emiss_val );
}

function PrepareSceneOBJ()
{
	// CalcRAxes
	for (var i in RAxes)
	{
		var bX=CfgGetVal_num(RAxes[i],'bX',0);
		var bY=CfgGetVal_num(RAxes[i],'bY',0);
		var bZ=CfgGetVal_num(RAxes[i],'bZ',0);
		var eX=CfgGetVal_num(RAxes[i],'eX',0);
		var eY=CfgGetVal_num(RAxes[i],'eY',0);
		var eZ=CfgGetVal_num(RAxes[i],'eZ',0);

		RAxes[i]['pivot'] = new THREE.Group();
		RAxes[i]['pivot'].position.set(eX,eY,eZ);
		RAxes[i]['pivot'].lookAt(bX,bY,bZ);
		RAxes[i]['pivot'].updateMatrixWorld(true);

		var pnt=new THREE.Mesh(new THREE.SphereGeometry(1),new THREE.MeshLambertMaterial({color: 0x00ffff}));
		pnt.position.set(bX,bY,bZ);
		var geometry = new THREE.Geometry();
		geometry.vertices.push( new THREE.Vector3(bX,bY,bZ),new THREE.Vector3(eX,eY,eZ));
		RAxes[i]['axe_line']=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0x00ffff}));
		RAxes[i]['axe_line'].add(pnt);
		RAxes[i]['axe_line'].applyMatrix(new THREE.Matrix4().getInverse(RAxes[i]['pivot'].matrixWorld));
		RAxes[i]['axe_line'].visible=false;

		RAxes[i]['pivot'].add(RAxes[i]['axe_line']);

		RAxes[i]['ZAng']=RAxes[i]['pivot'].rotation.z;

		var parentName=CfgGetVal_str(RAxes[i],'parent','none');
		if ((parentName != 'none') && (RAxes[parentName] != undefined))
		{
			RAxes[i]['pivot'].applyMatrix(new THREE.Matrix4().getInverse(RAxes[parentName]['pivot'].matrixWorld));
			RAxes[parentName]['pivot'].add(RAxes[i]['pivot']);
		} else scene.add(RAxes[i]['pivot']);
	}

	for (var i in SceneOBJ)
	{
		scene.add(SceneOBJ[i]['mesh']);

		// Shadows apply
		SceneOBJ[i]['mesh'].receiveShadow=CfgGetVal_switch(SceneOBJ[i],'shadowR','off');
		SceneOBJ[i]['mesh'].castShadow=CfgGetVal_switch(SceneOBJ[i],'shadowC','on');

		// Apply RAxes, set DragObjects, set SelectObjects
		var AxeName=CfgGetVal_str(SceneOBJ[i],'RAxe','');
		if (CfgGetVal_switch(SceneOBJ[i],'rotate','on') && (AxeName != '') && (RAxes[AxeName] != undefined))
		{
			RAxes[AxeName]['pivot'].add(SceneOBJ[i]['mesh']);
			SceneOBJ[i]['mesh'].applyMatrix(new THREE.Matrix4().getInverse(RAxes[AxeName]['pivot'].matrixWorld));

			DragObjects.push(SceneOBJ[i]['mesh']);
		}

		if (CfgGetVal_str(SceneOBJ[i],'onclick','') != '')
		{
			SelectObjects.push(SceneOBJ[i]['mesh']);
		}
	}

	// Set DragEvents
	/*if (DragObjects.length > 0)
	{
		dragControls = new THREE.DragControls( DragObjects, camera, renderer.domElement );
		dragControls.addEventListener( 'dragstart', function ( event ) { if (controls != undefined) { controls.enabled = false; } } );
		dragControls.addEventListener( 'dragend', function ( event ) { if (controls != undefined) { controls.quiet_cnt = controls.quiet_val; controls.enabled = true; } } );
	}*/

	//alert(SelectObjects.length);

	// Set SelectEvents
	if (SelectObjects.length > 0)
	{
		selControls = new THREE.SelectControls( SelectObjects, camera, renderer.domElement );
		selControls.addEventListener( 'selectstart', function ( event ) { if (controls != undefined) { controls.enabled = false; } } );
		selControls.addEventListener( 'selectend', function ( event ) { if (controls != undefined) { controls.quiet_cnt = controls.quiet_val; controls.enabled = true; } } );
	}

}

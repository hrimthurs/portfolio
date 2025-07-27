var hlprAxis, hlprGroundGrid, lookAtMesh, sunDLight;

function drawAxes(size,position, rotation)
{
	size = size || 1;

	var vertices = new Float32Array( [
	0, 0, 0, size, 0, 0,
	0, 0, 0, 0, size, 0,
	0, 0, 0, 0, 0, size
	] );

	var colors = new Float32Array( [
	1, 0, 0, 1, 0.6, 0,
	0, 1, 0, 0.6, 1, 0,
	0, 0, 1, 0, 0.6, 1
	] );

	var geometry = new THREE.BufferGeometry();
	geometry.addAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	geometry.addAttribute( 'color', new THREE.BufferAttribute( colors, 3 ) );
	var material = new THREE.LineBasicMaterial( { vertexColors: THREE.VertexColors } );
	var mesh = new THREE.Line(geometry, material, THREE.LinePieces );
	mesh.position.set(position.x, position.y, position.z);
	mesh.rotation.set(rotation.x, rotation.y, rotation.z);
	return mesh;
}

function dbgDataLogConsole(CfgArr)
{
	for (var i in CfgArr)
	{
		var val=CfgArr[i];
		if (val instanceof Array)
		{
			val='';
			for (var j in CfgArr[i]) { val=val+j+'='+CfgArr[i][j]+', ';}
			val=val.substring(0, val.length-2);
		}
	}

	for (i in SceneOBJ)
	{
		val=SceneOBJ[i];
		if (val instanceof Array)
		{
			val='';
			for (j in SceneOBJ[i]) { val=val+j+'='+SceneOBJ[i][j]+', '; }
			val=val.substring(0, val.length-2);
		}
	}

	for (i in SubScene)
	{
		val=SubScene[i];
		if (val instanceof Array)
		{
			val='';
			for (j in SubScene[i]) { val=val+j+'='+SubScene[i][j]+', '; }
			val=val.substring(0, val.length-2);
		}
	}

	for (i in RAxes)
	{
		val=RAxes[i];
		if (val instanceof Array)
		{
			val='';
			for (j in RAxes[i]) { val=val+j+'='+RAxes[i][j]+', '; }
			val=val.substring(0, val.length-2);
		}
	}
}

function isDebugMode()
{
	return (UrlGetValue('debug_mode').toLowerCase() == 'on');
}

function ScreenShot()
{
	DbgSceneObjectsVisible(false);

	var w = window.open('', '');
	w.document.title = "Screenshot";
	var img = new Image();
	renderer.render(scene, camera);
	img.src = renderer.domElement.toDataURL();
	w.document.body.appendChild(img);

	DbgSceneObjectsVisible(true);
}

function ResetScene()
{
	CfgSetCamPosition(CfgScene);
	for (var i in RAxes) RAxes[i]['pivot'].rotation.z=RAxes[i]['ZAng'];
}

function DbgObjToScene()
{
	hlprAxis = new THREE.AxisHelper(90);
	hlprAxis.position.set(0,0,0.5);
	scene.add(hlprAxis);

	stats = new Stats();
	container.appendChild( stats.dom );

	hlprGroundGrid= new THREE.GridHelper( 500, 50, 0xffffff, 0x999999);
	hlprGroundGrid.rotation.set(Math.PI/2,Math.PI/2,0);
	scene.add( hlprGroundGrid );

	lookAtMesh = new THREE.Mesh(new THREE.SphereGeometry(2),new THREE.MeshLambertMaterial({color: 0xff0000}));
	lookAtMesh.position.set(camLookAtX,camLookAtY,camLookAtZ);
	scene.add(lookAtMesh);

	if (lightDir != undefined)
	{
		sunDLight= new THREE.Mesh( new THREE.SphereGeometry(10),new THREE.MeshStandardMaterial({color:0xFFD700}));
		sunDLight.position.x=lightDir.position.x;
		sunDLight.position.y=lightDir.position.y;
		sunDLight.position.z=lightDir.position.z;
		scene.add(sunDLight);
	}

	DbgSceneObjectsVisible(true);
}

function DbgInfUpdate()
{
	document.getElementById('dbgInf_camPosX').innerHTML=camera.position.x.toFixed(2);
	document.getElementById('dbgInf_camPosY').innerHTML=camera.position.y.toFixed(2);
	document.getElementById('dbgInf_camPosZ').innerHTML=camera.position.z.toFixed(2);
	document.getElementById('dbgInf_distance').innerHTML=Math.sqrt((Math.pow(camera.position.x,2)+Math.pow(camera.position.y,2)+Math.pow(camera.position.z,2))).toFixed(2);

	document.getElementById('dbgInf_ctlAzimuth').innerHTML=controls.getAzimuthalAngle().toFixed(2);
	document.getElementById('dbgInf_ctlPolar').innerHTML=controls.getPolarAngle().toFixed(2);
}

function DbgSceneObjectsVisible(f_dbg_on)
{
	hlprAxis.visible=f_dbg_on;
	hlprGroundGrid.visible=f_dbg_on;
	lookAtMesh.visible=f_dbg_on;

	for (var i in RAxes) { RAxes[i]['axe_line'].visible=f_dbg_on; }

	if (addGGrid != undefined) { addGGrid.visible=!f_dbg_on; }
	if (sunDLight != undefined) { sunDLight.visible=f_dbg_on; }
}
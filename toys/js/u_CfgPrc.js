var INI = INI || {};
(function() {

	function ParsProperties(src)
	{
		var res=[];
		arrProperties=src.replace(/\{|\}|\s+/g,'').split(';').filter(function(e){return e});

		for (var i=0; i<arrProperties.length; i++)
		{
			property=arrProperties[i].split(':');
			res[property[0].toLowerCase()]=property[1];
		}

		return res;
	}

	var validateDelimiter = function(delimiter) {
		delimiter = String(delimiter || '/').charAt(0);
		if (delimiter == '[' || delimiter == ']' || delimiter <= ' ') {
			throw new Error('Illegal delimiter: "' + delimiter + '"');
		}
		return delimiter;
	};
	INI.stringify = function(value, levelDelimiter) {
		levelDelimiter = validateDelimiter(levelDelimiter);
		var walk = function(result, value, upperLevel) {
			var section = [];
			for (var p in value) {
				if (!value.hasOwnProperty(p)) {
					continue;
				}
				var v = value[p];
				var t = Object.prototype.toString.call(v);
				if (t == '[object Object]') {
					section.push('\n\n[' + upperLevel + p + ']\n');
					walk(section, v, upperLevel + p + levelDelimiter);
					continue;
				}
				v = [].concat(v);
				for (var i = 0; i < v.length; i++) {
					result.push(p + '=' + v[i]);
				}
			}
			result.push.apply(result, section);
		};
		var result = [];
		walk(result, value, '');
		return result.join('\n');
	};

	INI.parse = function(text, levelDelimiter, deepen) {
		levelDelimiter = validateDelimiter(levelDelimiter);
		var result = {};
		var ptr = result;
		var setPtr = (function() {
			if (!deepen) {
				return function(section) {
					if (!result.hasOwnProperty(section)) {
						result[section] = {};
					}
					ptr = result[section];
				}
			}
			return function(section) {
				var t = section.split(levelDelimiter);
				ptr = result;
				for (var i = 0; i < t.length; i++) {
					var u = t[i];
					if (!u) {
						continue;
					}
					if (!ptr.hasOwnProperty(u)) {
						ptr[u] = {};
					}
					ptr = ptr[u];
				}
			}
		})();
		var nextLine = (function() {
			if (typeof text == 'function') {
				return text;
			}
			if (Object.prototype.toString.call(text) == '[object Array]') {
				var n = text.length;
				var i = 0;
				return function() {
					return n-- ? text[i++] : null;
				};
			}
			var re = /[^\r\n]+/g;
			return function() {
				var r = re.exec(text);
				return r && r[0];
			}
		})();

		var reSec = /^\s*\[([^\[\]]+)\]\s*$/;
		var reKey = /^\s*([^;#\s][^=]*?)\s*=([^\r\n]*?)$/;
		var line, m, k, v;

		while ((line = nextLine()) != null)
		{
			line = line.split('//')[0].trim();
			if (line == '') continue;

			//alert('"'+line+'"');

			m = line.match(reSec);

			if (m)
			{
				setPtr(m[1]);
				continue;
			}

			m = line.match(reKey);

			if (m)
			{
				k = m[1].trim().toLowerCase();
				v = m[2].trim();

				//alert('"'+k+'" '+'"'+v+'" ');

				if ((v.charAt(0)=='{')&&(v.charAt(v.length-1)=='}')) { v=ParsProperties(v); }

				if ((k == 'loadmodel') && (v['name'] != undefined))
				{
					var obj_name=v['name'];
					delete v['name'];
					SceneOBJ[obj_name]=v;
				} else

				if ((k == 'raxe') && (v['name'] != undefined))
				{
					var obj_name=v['name'];
					delete v['name'];
					RAxes[obj_name]=v;
				} else

				if ((k == 'subscene') && (v['name'] != undefined) && (v['obj'] != undefined))
				{
					var obj_name=v['name'];
					delete v['name'];
					SubScene[obj_name]=v['obj'].split(',');
				} else

				{
					if (!ptr.hasOwnProperty(k))
					{
						{ ptr[k] = v; }
					} else
					{
						if (typeof ptr[k] == 'string') { ptr[k] = [ptr[k]]; }
						ptr[k].push(v);
					}
				}

				continue;
			}
		}

		return result;
	};
})();

function CfgIsExistKey(CfgArr, key)
{
	return CfgArr.hasOwnProperty(key.toLowerCase());
}

function CfgGetVal_str (CfgArr, val_name, val_default)
{
	var res=CfgArr[val_name.toLowerCase()];

	if (res == undefined)
	{
		if (val_default != undefined) { res=val_default; } else { res=''; }
	}

	return res;
}

function CfgGetVal_arr (CfgArr, val_name, val_default)
{
	var res;
	var vn=val_name.toLowerCase();

	if (vn in CfgArr)
	{
		res=CfgArr[vn];
	} else
	{
		if (val_default != undefined) { res=val_default; } else { res=[]; }
	}

	return res;
}

function CfgGetVal_num (CfgArr, val_name, val_default)
{
	var res=Number(CfgGetVal_str(CfgArr,val_name,''));

	if ((isNaN(res))||(res == ''))
	{
		if (val_default != undefined) { res=val_default; } else { res=0; }
	}

	return res;
}

function CfgGetVal_switch (CfgArr, val_name, val_default)
{
	var res=CfgGetVal_str(CfgArr,val_name,'').toLowerCase();

	if ((res == undefined)||((res != 'on')&&(res != 'off')))
	{
		if (val_default != undefined) { res=val_default; } else { res='off'; }
	}

	return (res == 'on');
}

function CfgSetCamPosition(CfgArr)
{
	if (CfgIsExistKey(CfgArr,'camPos'))
	{
		var cpos=CfgGetVal_arr(CfgArr,'camPos');

		var posX=CfgGetVal_num(cpos,'x',0);
		var posY=CfgGetVal_num(cpos,'y',70);
		var posZ=CfgGetVal_num(cpos,'z',70*3.5);

		camera.position.set(posX,posY,posZ);
	}

	if (CfgIsExistKey(CfgArr,'camLookAt'))
	{
		var lookAt=CfgGetVal_arr(CfgArr,'camLookAt');

		camLookAtX=CfgGetVal_num(lookAt,'x',0);
		camLookAtY=CfgGetVal_num(lookAt,'y',0);
		camLookAtZ=CfgGetVal_num(lookAt,'z',0);

		camera.lookAt(new THREE.Vector3(camLookAtX,camLookAtY,camLookAtZ));

		if (controls != undefined)
		{
			controls.target.set(camLookAtX,camLookAtY,camLookAtZ);
			controls.update();
		}
	}

}

function CfgSetAnmAutoRotate(CfgArr)
{
	if ((!isDebugMode()) && (UrlGetValue('auto_anm').toLowerCase() != 'off') && (CfgIsExistKey(CfgArr,'anmAuto')) && (controls != undefined))
	{
		var anmAuto=CfgGetVal_arr(CfgArr,'anmAuto');

		if (controls != undefined)
		{
			controls.quiet_val=CfgGetVal_num(anmAuto,'quiet',0);
			controls.autoRotateH=CfgGetVal_num(anmAuto,'rotH',0);
			controls.autoRotateV=CfgGetVal_num(anmAuto,'rotV',0);
			controls.autoRotateReverse=CfgGetVal_switch(anmAuto,'rotRev','off');
		}
	}
}

function CfgSetControls(CfgArr)
{
	if ((!isDebugMode()) && (CfgIsExistKey(CfgArr,'ctrlSettings')) && (controls != undefined))
	{
		var ctrlSet=CfgGetVal_arr(CfgArr,'ctrlSettings');

		controls.enableZoom=CfgGetVal_switch(ctrlSet,'zoom','on');
		controls.enableRotate=CfgGetVal_switch(ctrlSet,'rotate','on');
		controls.enablePan=CfgGetVal_switch(ctrlSet,'pan','on');

		controls.minDistance=CfgGetVal_num(ctrlSet,'minDist',0);
		controls.maxDistance=CfgGetVal_num(ctrlSet,'maxDist',Infinity);
		controls.minPolarAngle=CfgGetVal_num(ctrlSet,'minPolarAng',0);
		controls.maxPolarAngle=CfgGetVal_num(ctrlSet,'maxPolarAng',Math.PI);
		controls.minAzimuthAngle=CfgGetVal_num(ctrlSet,'minAzAng',-Infinity);
		controls.maxAzimuthAngle=CfgGetVal_num(ctrlSet,'maxAzAng',Infinity);

		controls.update();
	}
}

function SubSceneCheckChange()
{
	var div_val=document.getElementById('CurrSubScene').innerHTML;
	if (div_val != CurrentSubScene) { SetScene(div_val); }
}

function SetScene(SSName)
{
	if ((SubScene[SSName] != undefined) && (SubScene[SSName] != ''))
	{
		CurrentSubScene=SSName;
		document.getElementById('CurrSubScene').innerHTML=SSName;
		// Показ объектов по установкам SubScene
		for (var i in SceneOBJ)
		{
			SceneOBJ[i]['mesh'].visible=(SubScene[SSName].indexOf(i) >= 0);
		}
	} else
	{
		CurrentSubScene='';
		document.getElementById('CurrSubScene').innerHTML='';
		// Показ объектов по установкам LoadModel
		for (var i in SceneOBJ)
		{
			SceneOBJ[i]['mesh'].visible=CfgGetVal_switch(SceneOBJ[i],'visible','on');
		}
	}
}

function CfgSetSubscene(CfgArr)
{
	if (!isDebugMode())
	{
		var first_SSName='';
		for (var i in SubScene)
		{
	        first_SSName=i;
	        break;
	    }

		var setSSName=CfgGetVal_str(CfgArr,'defaultsubscene',first_SSName);
		if (SubScene[setSSName] == undefined) { setSSName=first_SSName; }

		SetScene(setSSName);
	}
}

function CfgSceneSetAdditional(CfgArr, PathModel)
{
	// POINT LIGHT
	if (CfgArr.hasOwnProperty('plight'))
	{
		var plight=CfgGetVal_arr(CfgArr,'plight');

		var pointLight = new THREE.PointLight(CfgGetVal_num(plight,'color',0xffffff), CfgGetVal_num(plight,'intensity',1), CfgGetVal_num(plight,'dist',1), CfgGetVal_num(plight,'decay',1));
		pointLight.position.set(CfgGetVal_num(plight,'x',0), CfgGetVal_num(plight,'y',0), CfgGetVal_num(plight,'z',0));
		scene.add(pointLight);
	}

	// LIGHT DIRECTIONAL
	if (CfgArr.hasOwnProperty('dlight'))
	{
		var dlight=CfgGetVal_arr(CfgArr,'dlight');

		lightDir = new THREE.DirectionalLight(CfgGetVal_num(dlight,'color',0xffffff),CfgGetVal_num(dlight,'intensity',1));
		lightDir.position.set(CfgGetVal_num(dlight,'x',0),CfgGetVal_num(dlight,'y',0),CfgGetVal_num(dlight,'z',0));
		lightDir.castShadow = CfgGetVal_switch(dlight,'shadow','off');
		lightDir.shadow.camera.top = CfgGetVal_num(dlight,'sh_cam_top',100);
		lightDir.shadow.camera.right = CfgGetVal_num(dlight,'sh_cam_right',100);
		lightDir.shadow.camera.left = CfgGetVal_num(dlight,'sh_cam_left',-100);
		lightDir.shadow.camera.bottom = CfgGetVal_num(dlight,'sh_cam_bottom',-100);
		lightDir.shadow.camera.near = CfgGetVal_num(dlight,'sh_cam_near',1);
		lightDir.shadow.camera.far = CfgGetVal_num(dlight,'sh_cam_far',500);
		scene.add( lightDir );
	}

	// LIGHT AMBIENT
	if (CfgArr.hasOwnProperty('alight'))
	{
		var alight=CfgGetVal_arr(CfgArr,'alight');

		lightAmb = new THREE.AmbientLight(CfgGetVal_num(alight,'color',0xffffff),CfgGetVal_num(alight,'intensity',1));
		scene.add(lightAmb);
	}

	// CAM POINT LIGHT
	if (CfgArr.hasOwnProperty('camplight'))
	{
		var plight=CfgGetVal_arr(CfgArr,'camplight');

		cam_plight = new THREE.PointLight(CfgGetVal_num(alight,'color',0xffffff),CfgGetVal_num(alight,'intensity',1));
		camera.add(cam_plight);
	}

	// CAMERA LIGHT DIRECTIONAL
	if (CfgArr.hasOwnProperty('camdlight'))
	{
		var dlight=CfgGetVal_arr(CfgArr,'camdlight');

		cam_dlight = new THREE.DirectionalLight(CfgGetVal_num(dlight,'color',0xffffff),CfgGetVal_num(dlight,'intensity',1));
		cam_dlight.position.set(CfgGetVal_num(dlight,'x',0),CfgGetVal_num(dlight,'y',0),CfgGetVal_num(dlight,'z',0));
		cam_dlight.castShadow = CfgGetVal_switch(dlight,'shadow','off');
		cam_dlight.shadow.camera.top = CfgGetVal_num(dlight,'sh_cam_top',100);
		cam_dlight.shadow.camera.right = CfgGetVal_num(dlight,'sh_cam_right',100);
		cam_dlight.shadow.camera.left = CfgGetVal_num(dlight,'sh_cam_left',-100);
		cam_dlight.shadow.camera.bottom = CfgGetVal_num(dlight,'sh_cam_bottom',-100);
		cam_dlight.shadow.camera.near = CfgGetVal_num(dlight,'sh_cam_near',1);
		cam_dlight.shadow.camera.far = CfgGetVal_num(dlight,'sh_cam_far',500);
		camera.add(cam_dlight);
	}

	// FOG
	if (CfgArr.hasOwnProperty('fog'))
	{
		var fog=CfgGetVal_arr(CfgArr,'fog');

		if (CfgGetVal_switch(fog,'visible','off'))
		{
			var color=CfgGetVal_str(fog,'color','bgc');
			if (color == 'bgc') { color=bgSceneColor; }

			scene.fog=new THREE.Fog('#'+color,CfgGetVal_num(fog,'near',100),CfgGetVal_num(fog,'far',1000));
		}
	}

	// GROUND GRID
	if (CfgArr.hasOwnProperty('groundgrid'))
	{
		var grid=CfgGetVal_arr(CfgArr,'groundgrid');

		if (CfgGetVal_switch(grid,'visible','off'))
		{
			var size=CfgGetVal_num(grid,'size',10);
			var div=CfgGetVal_num(grid,'div',10);
			var color_axis=CfgGetVal_str(grid,'c_axis','0000FF');
			var color_grid=CfgGetVal_str(grid,'c_grid','00FF00');
			var posX=CfgGetVal_num(grid,'x',0);
			var posY=CfgGetVal_num(grid,'y',0);
			var posZ=CfgGetVal_num(grid,'z',0);

			addGGrid=new THREE.GridHelper(size,div,'#'+color_axis,'#'+color_grid);
			addGGrid.position.set(posX,posY,posZ);
			addGGrid.rotation.set(Math.PI/2,Math.PI/2,0);
			scene.add(addGGrid);
		}
	}

	// SEA
	if (CfgArr.hasOwnProperty('sea'))
	{
		var sea=CfgGetVal_arr(CfgArr,'sea');

		if (CfgGetVal_switch(sea,'visible','off'))
		{
			parameters.oceanSide=CfgGetVal_num(sea,'oceanside',2000);
			parameters.size=CfgGetVal_num(sea,'size',1.0);
			parameters.distortionScale=CfgGetVal_num(sea,'distortionscale',3.7);
			parameters.alpha=CfgGetVal_num(sea,'alpha',1.0);

			var wnFile=PathModel+CfgGetVal_str(sea,'wnfile','');

			water = new THREE.Water(
				parameters.oceanSide * 5,
				parameters.oceanSide * 5,
				{
					textureWidth: 512,
					textureHeight: 512,
					waterNormals: new THREE.TextureLoader().load(wnFile, function ( texture )
						{
							texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
						}),
					alpha: 	parameters.alpha,
					sunColor: 0xffffff,
					waterColor: CfgGetVal_num(sea,'wcolor',0x001e0f),
					distortionScale: parameters.distortionScale,
					fog: scene.fog != undefined
				}
			);

			if (lightDir != undefined) water.sunDirection=lightDir.position.clone().normalize();

			water.position.z = CfgGetVal_num(sea,'z',0);
			water.receiveShadow = true;
			scene.add( water );
		}
	}
}

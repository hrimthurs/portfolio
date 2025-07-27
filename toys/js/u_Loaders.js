var cntActiveLoad;

var f_GetFromZip = false;

function LoadModelObj( path, obj_file, cDefMat, fDSide)
{				
	var objLoader = new THREE.OBJLoader();
		
	objLoader.setPath( path );
	objLoader.load( obj_file, function ( object ) {scene.add( object );}, onProgress, onError, cDefMat );
}			

function LoaderModel(path, ModelName, cDefMat, load_complete_prc)
{
	cntActiveLoad++;					

	var obj_file=ModelName+'.obj';
	var mtl_file=ModelName+'.mtl';
	
	var model_path=CfgGetVal_str(SceneOBJ[ModelName],'path','');
	if (model_path != '') path=path+model_path+'/';
	
	var mtlLoader = new THREE.MTLLoader();
	mtlLoader.setPath( path );				
	mtlLoader.load( mtl_file, function( materials ) 
	{									
		materials.preload();
		var objLoader = new THREE.OBJLoader();
		objLoader.setMaterials( materials );
		objLoader.setPath( path );
		objLoader.load( obj_file, function ( object ) 
		{
			SceneOBJ[ModelName]['mesh']=object.mesh;
			SceneOBJ[ModelName]['mesh'].name=ModelName;
			SceneOBJ[ModelName]['mesh'].visible=CfgGetVal_switch(SceneOBJ[ModelName],'visible','on');
			SceneOBJ[ModelName]['materials']=object.materials;
			
			cntActiveLoad--;
									
			if (cntActiveLoad == 0) 
			{
				if (f_GetFromZip) { KillFilesInZIP(); };				
				load_complete_prc(); 
			}
		}, onProgress, onError, cDefMat, CfgGetVal_switch(SceneOBJ[ModelName],'dside','off'));
	});			
}


function LoadModels(f_fromZIP, path, cDefMat, ModelsToLoad, load_complete_prc)
{
	cntActiveLoad=0;
	f_GetFromZip=f_fromZIP;
	
	if (ModelsToLoad instanceof Array) 
	{				
		for (var i in ModelsToLoad) { LoaderModel(path, i, cDefMat, load_complete_prc); }													
	} else
	{
		LoaderModel(path, ModelsToLoad, cDefMat, load_complete_prc);
	}
}

function LoadSceneModels(path, zipFName, cDefMat, ModelsToLoad, complete_prc)
{			
	THREE.Cache.enabled = true;

	if (zipFName =='')
	{
		LoadModels(false, path, cDefMat, ModelsToLoad, complete_prc);
	} else
	{	
		zip_LoadArchive(path, zipFName, function () { LoadModels(true, path, cDefMat, ModelsToLoad, complete_prc); });
	}	
}




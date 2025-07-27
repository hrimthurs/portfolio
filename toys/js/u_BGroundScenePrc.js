var bgSceneColor; 
var bgSceneImage;
var bgSceneImageSize;

function SetBGroundScene(model_name)
{
	var bgSceneModel=CfgGetVal_arr(CfgScene,'bgscene');
	var bgSceneTotal=CfgGetVal_arr(CfgTotal,'bgscene');
	
						
	var bgColorClientSet=UrlGetValue('bg_color');
	
	if (bgColorClientSet != '')
	{
		bgSceneColor=bgColorClientSet;
		document.body.style.backgroundColor = '#'+bgColorClientSet;
		renderer.setClearColor('#'+bgColorClientSet);					
//		alert(bgColorClientSet);
	} else
	{
		// Set BgColor				
		bgSceneColor=CfgGetVal_str(bgSceneModel,'color',CfgGetVal_str(bgSceneTotal,'color','FFFFFF'));
		document.body.style.backgroundColor = '#'+bgSceneColor;
		renderer.setClearColor('#'+bgSceneColor);					
			
		// Get BgImage
		bgSceneImage=CfgGetVal_str(bgSceneModel,'img');
		
		if (bgSceneImage != '')
		{
			bgSceneImage=ModelsPath+model_name+'/'+bgSceneImage;		
			bgSceneImageSize=CfgGetVal_str(bgSceneModel,'imgSize','auto');
		} else 
		{
			bgSceneImage=CfgGetVal_str(bgSceneTotal,'img');		
			if (bgSceneImage != '') 
			{
				bgSceneImage=ImagesPath+bgSceneImage;
				bgSceneImageSize=CfgGetVal_str(bgSceneTotal,'imgSize','auto');
			}	
		}
			
		// Set BgImage	
		if ((bgSceneImage != '') && (CfgGetVal_switch(bgSceneModel,'useImg','on')))
		{		
			if (bgSceneImageSize == 'auto')
			{
				scene.background=new THREE.TextureLoader().load(bgSceneImage);
			} else if (bgSceneImageSize == 'cover')
			{
				// !!!!
			} else if (bgSceneImageSize == 'contain')
			{
			}
			
			/*
			if ((CfgArr['imgBackgroundSize'] != undefined)&&(CfgArr['imgBackgroundSize'] != '')) { document.body.style.backgroundSize = CfgArr['imgBackgroundSize']; };
			document.body.style.backgroundImage = "url('"+ModelsPath+model+"/"+img_fname+"')";								
			renderer.setClearColor( 0xffffff, 0);				
			*/
		}
	}
}

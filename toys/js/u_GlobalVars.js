var fnTotalCfg = './total.cfg';
var fnModelCfg = './model.cfg';
var ModelsPath = 'models/';
var ImagesPath = 'images/';

var bgImgLoading='startBG_default.jpg';
var bgImgLoadingDef='back_load.jpg';
var imgNoticeErr='Stop_X.png';
var imgLoadingAnm='loader2.gif';

var FadeInTime = 1000;

var CfgTotal, CfgScene;

var model;
var container, stats;
var camera, scene, renderer, controls, dragControls, selControls;
var lightDir, lightAmb;
var cam_plight, cam_dlight;

var addGGrid;

var camLookAtX, camLookAtY, camLookAtZ;

var SceneOBJ=[];
var SubScene=[];

var CurrentSubScene='';

var DragEmissiveColor=0x444444;
var DragObjects=[];

var SelectEmissiveColor=0x444444;
var SelectObjects=[];

var RAxes=[];

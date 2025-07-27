var FilesInZIP = new Array();
var cntFilesUnzip;

function zip_LoadArchive (path, fname, cback_proc, progress_proc)
{
	zip.useWebWorkers = false;
	cntFilesUnzip = 50000;

	var loaderZIP = new THREE.FileLoader();
	if (path != '') { loaderZIP.setPath(path); };
	loaderZIP.setResponseType('blob');
	loaderZIP.setMimeType('text/plain');
	loaderZIP.load( fname, function ( blob )
	{
		zip.createReader(new zip.BlobReader(blob), function(zipReader)
		{
			zipReader.getEntries(function(entries)
			{
				FilesInZIP=[];
				cntFilesUnzip=entries.length;

				entries.forEach(function(ent,i)
				{
					entries[i].getData(new zip.BlobWriter("text/plain"), function(blob)
					{
						var reader = new FileReader();
						reader.onload = function(e)
						{
							//FilesInZIP[entries[i].filename]=e.target.result;
							FilesInZIP.push({'fname':entries[i].filename, 'data':e.target.result});

							cntFilesUnzip--;
							if (cntFilesUnzip == 0)
							{
								zipReader.close();
								cback_proc();
							};

							if (progress_proc != undefined) { progress_proc(cntFilesUnzip,entries.length); }

						};
						reader.readAsText(blob);
					});
				});
			});
		});
	});
};


function zip_GetIndByFname(find_fname)
{
	var res=-1;

	for (var i=0; i<FilesInZIP.length; i++)
	{
		if (FilesInZIP[i].fname == find_fname)
		{
			res=i;
			break;
		};
	};

	return res;
};

function KillFilesInZIP()
{
	delete FilesInZIP;
	FilesInZIP=null;
};

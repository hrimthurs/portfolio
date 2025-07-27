function AddMenuItem(id_item, glyph_chr, click_prc)
{
	var ItemData;
	
	if (click_prc != '')
	{
		ItemData = "<div class='menu_item_contain'> <div id="+id_item+" class='menu_item' data-icon='"+glyph_chr+"' onclick='"+click_prc+"'></div>  </div>";
	} else
	{
		ItemData = "<div class='menu_item_contain'> <div id="+id_item+" class='menu_item_disable' data-icon='"+glyph_chr+"'></div>  </div>";
	}
	
	var trs = document.getElementById('menu').getElementsByTagName('tr');
	var x = trs[0].insertCell(0);
	x.innerHTML = ItemData;
}

function SetGSize(el, new_size)
{
	el.style.fontSize=new_size;				
	el.style.width=new_size;
	el.style.height=new_size;				
}

function MenuResize()
{
	var items=document.getElementsByClassName('menu_item_contain');
	
	if	(items.length>0)
	{
		var size=parseInt(window.getComputedStyle(items[0], null).width)-12+'px';				
		
		var items=document.getElementsByClassName('menu_item');				
		for (var i=0; i<items.length; i++) { SetGSize(items[i],size); };

		items=document.getElementsByClassName('menu_item_disable');				
		for (var i=0; i<items.length; i++) { SetGSize(items[i],size); };
	}	
}	
			
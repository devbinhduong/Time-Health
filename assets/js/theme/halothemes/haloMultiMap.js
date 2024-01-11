var bbENVmap;

function ENV_initMap(){
	bbENVmap.intialize();
}

function ENV_map(){
	var t=this;

	bbENVmap=this;

	this.vars={};
	this.map='';

	this.view=function(ops){
		var dfs={
			'token':'Envora_free',
			'name':'ENV_maps_',
			'api':'AIzaSyCHk1k1Xj_gzxjh10jN873yGvzxxF6qXbI_ji',
			'get_map':'',
			'get_list':'',
			'get_search':'',
			'display_stt':true,
			'center':true,
			'replace_market':false,
			'zoom':8,
			'callback_google':'ENV_initMap',
			'callback_search':function(){},
			'callback':function(){},
			'callback_remap':function(){},
			'callback_list_click':function(){},
			'icon_default':'',
			'data':[
				{
					'lat':-25.363,
					'lng':131.044,
					'name':'',
					'address':'',
					'phone':''
				}
			]
		};
		ops=$.extend({},dfs,ops);
		ops.nf='bbENVmap';
		ops.re=$('.'+ops.name+'head_already').length;

		if(!ops.re){
			t.vars=ops;
			
		} else {
			t.vars.re=ops.re;
			t.vars.data=ops.data;
			t.vars.replace_market=ops.replace_market;
			t.vars.callback_remap=ops.callback_remap;
		}
		
		get_token();

		$(ops.get_map).addClass(ops.name+'_div');
		var vv={
			'lat':0,
			'lng':0,
			'count':0
		};
		
		for(var i=0;i<ops.data.length;i++) {
			ops.data[i].lat=parseFloat(ops.data[i].lat);
			ops.data[i].lng=parseFloat(ops.data[i].lng);
			vv.lat+=ops.data[i].lat;	
			vv.lng+=ops.data[i].lng;	
			vv.count++;
		}

		vv.lat=vv.lat/vv.count;
		vv.lng=vv.lng/vv.count;
		t.vars.mk_center=vv;
		
		if(!t.vars.re){
			ahead();
		} else{
			t.intialize();
		}
	
	}

	function get_token(){
		if(t.vars.token=='Envora_free'){
			t.vars.api='AIzaSyCHk1k1Xj_gzxjh10jN873yGvzxxF6qXbI';
		}	
	}

	function ahead(){
		var ss='&sensor=false&v=3&libraries=geometry';

		if(!t.vars.get_search){
			ss='';
		}

		var s="<script src='https://maps.googleapis.com/maps/api/js?key="+t.vars.api+ss+"&callback="+t.vars.callback_google+"'  async defer></script>";
		
		$('head').append(s);

		addStyle();
	}

	function center_data(){
		t.setCenter(t.vars.mk_center.lat,t.vars.mk_center.lng);
	}

	function addStyle(){
		var s='',n=t.vars.name;

		s+="."+n+"_div {min-height:600px;min-width:300px;}";
		s+="."+n+"_div img{max-height:inherit !important;} ";
		s+="."+n+"_div "+n+"html {}";
		s+="."+n+"html .lat,."+n+"html .lng{display:none;}";
		s+="."+n+"_div_search input {}";
		s="<style id='"+t.vars.name+"head' >"+s+"</style>";
		$('head').append(s);
	}

	function add_list(d,stt){
		return "<div onclick='"+t.vars.nf+".select_market("+stt+")'>"+t.view_html(d,'elist')+"</div>";
	}

	this.select_market=function(num){
		t.vars.callback_list_click(t.vars.mk[num]);
		new google.maps.event.trigger(t.vars.mk[num],'click');
		t.setCenter(t.vars.data[num].lat,t.vars.data[num].lng);
	}

	this.setCenter=function(a,b,c){
		if(!c){
			c = new google.maps.LatLng(a, b);
		}
		
		t.map.setCenter(c);
	}

	this.config=function(){}
	
	this.intialize=function(){
		t.config();

		var vv={'s':''};

		if(!t.vars.re){
			vv.center={
				lat: t.vars.mk_center.lat,
				lng: t.vars.mk_center.lng
			};

			if(t.vars.center){
				if(typeof t.vars.center=='object'){
					vv.center=t.vars.center;
				}
			}

			t.map=new google.maps.Map(document.querySelector(t.vars.get_map), {
			  center: vv.center,
			  zoom: t.vars.zoom,
			});

			$('#'+t.vars.name+'head').addClass(t.vars.name+'head_already');
			t.vars.mk=[];
			t.vars.window=[];
			t.vars.exist=[];
		} else{
			center_data();
		}

		if(t.vars.replace_market){
			for(var i=0;i<t.vars.mk.length;i++){
				t.vars.mk[i].setMap(null);
			}

			t.vars.mk=[];
			t.vars.window=[];
			t.vars.exist=[];	
		}

		var di=t.vars.data,d,df={},ex;
		var count_m=t.vars.mk.length;
		if(t.vars.icon_default){
			df={
				'icon':t.vars.icon_default
			};
		}

		$.each(t.vars.data,function(i,d){
			var kk={};
			d.lat=parseFloat(d.lat);
			d.lng=parseFloat(d.lng);
			kk.id=d.lat+'_'+d.lng;
				
			if(t.vars.exist.indexOf(kk.id)==-1){
				t.vars.exist.push(kk.id);

				var ci=t.vars.exist.length-1;

				ex={
					position: {
						'lat':d.lat,
						'lng':d.lng
					},
					map: t.map,
					title: d.name,
				};

				if(t.vars.display_stt){
					ex.label=(ci+1).toString();
				}

				ex=$.extend({},ex,df);

				t.vars.mk[ci]=new google.maps.Marker(ex);

				t.vars.window[ci]=new google.maps.InfoWindow({
					content: t.view_html(d)
			  	});

				t.vars.mk[ci].addListener('click', function() {
					for(var j=0;j<t.vars.exist.length;j++){
						t.vars.window[j].close();	
					}

					t.vars.window[ci].open(t.map, t.vars.mk[ci]);
				});
			}

			vv.s+=add_list(d,t.vars.exist.indexOf(kk.id));
		});

		if(t.vars.get_list){
			$(t.vars.get_list).addClass(t.vars.name+'list');
			document.querySelector(t.vars.get_list).innerHTML=vv.s;
		}

		if(t.vars.get_search){
			vv.s=t.form_search();
			document.querySelector(t.vars.get_search).innerHTML=vv.s;
		}

		if(t.vars.callback_remap){
			t.vars.callback_remap();
		}
	}

	this.form_search=function(){
		var name=t.vars.name+'_input_search';

		return "<div class='"+t.vars.name+"_div_search'><label class='form-label' for='"+name+"'><svg class='icon' aria-hidden='true'><use xlink:href='#icon-search'></use></svg><span>Search</span></label><input class='form-input' type='text' id='"+name+"'><span class='button button--tertiary' onclick='"+t.vars.nf+".search_near($(\"#"+name+"\").val())'>Search</span></div>";
	}

	this.view_market=function(d){}

	this.view_html=function(dd,cl){
		var d=$.extend({},{},dd);
		var s='';
		if(!cl){
			cl='window';
		}

		$.each(d,function(k,v){
			s+="<span class='"+k+"'>"+v+"</span>";
		});

		s="<div class='"+t.vars.name+cl+' '+t.vars.name+"html'>"+s+"</div>";

		return s;
	}

	this.icon_type=function(type,ops){
		function load(m,ob){
			var vv={};

			for(var i=0;i<m.length;i++){
				vv[m[i]]=ob[m[i]];
			}
		}

		if(type=='image'){
			var m=['url'];
			return load(m,ops);
		}

		if(type=='image_custome'){
			var m=['url','size','origin','anchor'];

			return load(m,ops);
		}
	}

	this.search_near=function(string,callback){
		if(!string){
			return false;
		}

		var calc_space=function(latLngA, latLngB){
			return google.maps.geometry.spherical.computeDistanceBetween(latLngA, latLngB);
		}
		
		var a=null;
		var rt=-1;
		var list=[];

		for(var i=0;i<t.vars.data.length;i++){
			list.push(new google.maps.LatLng(t.vars.data[i].lat, t.vars.data[i].lng));
		}

		var geocoder=new google.maps.Geocoder();

		geocoder.geocode({'address':string},function(results, status){
			if (status != google.maps.GeocoderStatus.OK){
				{alert(string + " not found");}
			} else {
				a=results[0].geometry.location;

				if(a && list.length){
					var min=calc_space(a,list[0]);
					var c=0;rt=0;

					for(var i=1;i<list.length;i++){
						c=calc_space(a,list[i]);
						
						if(min>c){
							min=c;
							rt=i;
						}
					}

					t.setCenter(0,0,list[rt]);
				}

				t.vars.callback_search();		
			}
		});
	}
}

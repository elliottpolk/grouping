/* Author:
	elliott.polk
*/

var curGrpId,
	curFareId,
	origHelperPos,
	prevGrpScrollPos = 0,
	dragCnt = 1,
	groups = {},
	fares = {};

function addGroupTile() {
	curGrpId += 1;
	var grpObj = new Object();
	var grpObjHtml = $('<div id="'+curGrpId+'" class="group-tile disable-highlight">GROUP '+curGrpId+'</div>');
	grpObj.html = $(grpObjHtml);
	grpObj.fares = new Array();
	grpObj.applist = new Array();
	grpObj.applicable = 'yes';

	$('#group-container').prepend($(grpObjHtml));
	$(grpObjHtml).append('<div id="'+curGrpId+'-cnt" class="counter">0</div>');
	$(grpObjHtml).droppable({
		drop: function(event, ui) {	
			var id = $(this).attr('id');
			var arr = new Array();
			$('.fare-tile-handle').each(function() {
				if($(this).attr('aria-checked') == 'true')
					arr.push($(this).attr('aria-labelledby'));
			});
			if(arr.length == 0)
				arr.push($((ui.draggable).children().get(1)).attr('id'));

			if(groups[id].fares == undefined || groups[id].fares.length == 0)
				groups[id].fares = arr;
			else {
				$(arr).each(function() {
					var tmpArrId = this;
					var found = false;
					$(groups[id].fares).each(function() {
						var tmpFareId = this;
						if(tmpFareId.indexOf(tmpArrId) > -1)
							found = true;
					});
					if(found != true) groups[id].fares.push(tmpArrId);
				});
			}

			$('#'+id+'-cnt').html(groups[id].fares.length);
			$('#selector').click();
		},
		hoverClass: 'active'
	});
	groups[curGrpId] = $(grpObj);

	$(grpObjHtml).click(function() {
		if($('#sub-grps').is(':visible')) $('#sub-grp-btn').click();

		$('.active').each(function() { $(this).removeClass('active'); });
		$(this).addClass('active');

		var fareGrpDisplay = $('#grp-display');
		$('#grp-display-id').html('GROUP '+$(this).attr('id'));
		$('#grp-display-id').attr('value',$(this).attr('id'));
		$('#grp-display-content').html('');

		var grpId = $(this).attr('id');
		$(groups[grpId].fares).each(function() {
			var tile = $('<div class="fare-tile disable-highlight" style="float: left; margin-left: 4px; cursor: pointer;" aria-checked="false"></div>');
			$(tile).append('<div id="sub-'+this+'-dlt" style="float: right; margin: 18px 8px auto; width: 12px; height: 12px; border: 1px solid rgba(155,155,155,0.75); background-image: url(../img/icon_sprites.png); background-position: 38px 38px;" role="checkbox" aria-labelledby="sub-'+this+'" aria-checked="false" tabindex="0"></div>');
			$(tile).append('<div id="sub-'+this+'" style="margin: 18px 8px auto;">FARE '+this+'</div>');
			$('#grp-display-content').prepend($(tile));
			$('#sub-'+this+'-dlt').click(function() {
				var id = $($(this).parent().children().get(1)).attr('id').split('-')[1];
				$(this).parent().remove();

				var tmpArr = new Array();
				var found = false;
				$(groups[grpId].applist).each(function() {
					if($(this).get(0) != id && $(this).get(1) != id)
						tmpArr.push($(this));
					else
						found = true;
				});
				groups[grpId].applist = tmpArr;
				if($('#sub-grps').is(':visible')) {
					// forces a rebuild of the 'sub-grps' list
					$('#sub-grp-btn').click();
					$('#sub-grp-btn').click();
				}
				
				groups[grpId].fares.pop(id);
				if(groups[grpId].fares.length != undefined)
					$('#'+grpId+'-cnt').html(groups[grpId].fares.length);
				else
					$('#'+grpId+'-cnt').html('0');
			});

			$(tile).click(function() {
				$('#grp-display-msg').html('');
				if($(this).attr('aria-checked') === 'true') {
					$(this).attr('aria-checked', 'false');
					$(this).removeClass('active');
					if($(this).attr('value') === '2')
						$(this).attr('value','');
					else {
						var thisval = $(this).attr('value');
						$('#grp-display-content').children('.fare-tile').each(function() {
							if($(this).attr('aria-checked') === 'true') $(this).attr('value',thisval);
						});
					}
				}else {
					var cnt = 0;
					$('#grp-display-content').children('.fare-tile').each(function() {
						if($(this).attr('aria-checked') === 'true') cnt++;
					});
					if(cnt < 2) {
						$(this).attr('aria-checked', 'true');
						$(this).addClass('active');
						if(cnt > 0) 
							$(this).attr('value','2');
						else 
							$(this).attr('value','1');
					}else
						$('#grp-display-msg').html('you may select only 2 fares');
				}
				
			});
		});
		if(groups[$(this).attr('id')].fares != undefined && groups[$(this).attr('id')].fares.length > 9) $('#grp-display-content').css({ 'overflow': 'auto' });
		$(fareGrpDisplay).show();
	});
}

function addFareTile() {
	curFareId += 1;
	var tile = $('<div class="fare-tile disable-highlight"></div>');
	$(tile).append('<div class="fare-tile-handle" role="checkbox" aria-labelledby="'+curFareId+'" aria-checked="false" tabindex="0"></div>');
	$(tile).append('<div id="'+curFareId+'" style="display: inline-block;">FARE '+curFareId+'</div>');
	$(tile).draggable({
		cursor: 'move',
		containment: 'document',
		appendTo: 'body',
		cursorAt: { 
			top: 16,
			left: 8
		},
		revert: function(event, ui) {
			var multi = false;
			$('.fare-tile-handle').each(function() {
				if($(this).attr('aria-checked') === 'true')
					multi = true;
			});

			if(multi == false) $(tile).css({ 'background-color': '#fff' });

			$(this).data('draggable').originalPosition = {
				top: $(tile).offset().top,
				left: $(tile).offset().left
			};
			return !event;
		},
		helper: function(event) {
			$(tile).css({ 'background-color': 'rgba(155,155,155,0.05)' });
			dragCnt = 1;
			var multi = false;
			$('.fare-tile-handle').each(function() { 
				if($(this).attr('aria-checked') === 'true') {
					multi = true;
					dragCnt++;
				}
			});
			if(multi == true) dragCnt--;
			return '<div id="'+curFareId+'-helper" class="drag-helper">'+dragCnt+' fare(s) selected</div>';
		}
	});
	$('#fare-container').prepend($(tile));
	fares[curFareId] = $(tile);

	$(tile).find('.fare-tile-handle').click(function() {
		if($(this).attr('aria-checked') === 'true') {
			$(this).attr('aria-checked', 'false');
			$(this).css({ 
				'background-image': 'url()',
				'background-position': '0px 0px'
			});
			$(this).parent().css({ 'background-color': '#fff' });
		}else {
			$(this).attr('aria-checked', 'true');
			$(this).css({ 
				'background-image': 'url(../img/icon_sprites.png)',
				'background-position': '79px 79px'
			});
			$(this).parent().css({ 'background-color': 'rgba(155,155,155,0.05)' });
		}
	});
}

function addSubRow(val1, val2) {
	var row = $('<div class="sub-list-item"></div>');
	$(row).append('<div class="sub-btn dlt-sub"></div>');
	$(row).click(function() {
		var grpId = $('#grp-display-id').attr('value');
		var index = -1;
		$(groups[grpId].applist).each(function(i) {
			if($(this).get(0) === val1 && $(this).get(1) === val2) 
				index = i;
		});
		groups[grpId].applist.pop(index);
		
		$('#sub-grp-btn').click();
		$('#sub-grp-btn').click();
	});

	var listspan = $('<span class="sub-list">'+val1+' | '+val2+'</span>');
	$(row).append($(listspan));

	$('#sub-content').append($(row));
}

function init() {
	$('#create-grp-btn').click(function() {	addGroupTile(); });
	$('#create-fare-btn').click(function() { addFareTile(); });

	var gcOffset = $('#fare-container').offset();
	$('#selector').offset({
		top: (gcOffset.top - 20),
		left: (gcOffset.left + 27)
	});
	$('#selector').mouseover(function() {
		$('body').append('<div id="alt-text">uncheck all</div>');
		var offset = $(this).offset();
		$('#alt-text').offset({
			top: (offset.top - 3),
			left: (offset.left - 64)
		});
	});
	$('#selector').mouseout(function() {
		$('#alt-text').remove();
	});
	$('#selector').click(function() {
		$('.fare-tile-handle').each(function() {
			$(this).attr('aria-checked','false');
			$(this).css({
				'background-image': 'url()',
				'background-position': '0px 0px'
			});
			$(this).parent().css({ 'background-color': '#fff' });
		});
	});

	$('#group-container').css({ 'box-shadow':'inset -1px -4px 15px rgba(0,0,0,0.07)' });
	$('#group-container').scroll(function() {
		var curPos = $(this).scrollTop();	
		if($(this).scrollTop() == 0) 
			$(this).css({ 'box-shadow':'inset -1px -4px 15px rgba(0,0,0,0.07)' });
		else if($(this).outerHeight() == ($(this).get(0).scrollHeight - $(this).scrollTop()))
			$(this).css({ 'box-shadow':'inset 0px 3px 15px rgba(0,0,0,0.07)' });
		else
			$(this).css({ 'box-shadow':'inset -1px -4px 15px rgba(0,0,0,0.07), inset 0px 3px 15px rgba(0,0,0,0.07)' });

		prevGrpScrollPos = curPos;
	});

	$('#fare-container').css({ 'box-shadow':'inset -1px -4px 15px rgba(0,0,0,0.07)' });
	$('#fare-container').scroll(function() {
		if($(this).scrollTop() == 0) 
			$(this).css({ 'box-shadow':'inset -1px -4px 15px rgba(0,0,0,0.07)' });
		else if($(this).outerHeight() == ($(this).get(0).scrollHeight - $(this).scrollTop()))
			$(this).css({ 'box-shadow':'inset 0px 3px 15px rgba(0,0,0,0.07)' });
		else
			$(this).css({ 'box-shadow':'inset -1px -4px 15px rgba(0,0,0,0.07), inset 0px 3px 15px rgba(0,0,0,0.07)' });

	});

	$('#grp-display-close').click(function() {
		$('#grp-display-content').html('');
		$('#grp-display').hide();
		$('div').find('.active').removeClass('active');
		$('#sub-grps').hide();
	});

	$('#sub-grp-btn').click(function() {
		$('#sub-grps').toggle();
		$('#sub-content').html('');	
		if($('#sub-grps').is(':visible')) {
			var grpId = $('#grp-display-id').attr('value');

			if(groups[grpId].applicable != undefined && groups[grpId].applicable === 'yes')
					$('#sub-yes').click();
				else
					$('#sub-no').click();

			if(groups[grpId] != undefined && groups[grpId].applist != undefined) {
				$(groups[grpId].applist).each(function() {
					addSubRow($(this).get(0), $(this).get(1));
				});
			}

			var row = $('<div class="sub-list-item"></div>');
			$(row).append('<div class="sub-btn add-sub"></div>');
			$(row).click(function() {
				var cnt = 0;
				var fare1, fare2;
				$('#grp-display-content').children('.fare-tile').each(function() {
					if($(this).attr('aria-checked') === 'true') {
						cnt++;

						if($(this).attr('value') === '1')
							fare1 = $(this);
						else
							fare2 = $(this);
					}
				});
				if(cnt < 2)
					$('#grp-display-msg').html('you must select at lest 2 fares');
				else {
					var val1 = $((fare1.children()).get(1)).attr('id').split('-')[1];
					var val2 = $((fare2.children()).get(1)).attr('id').split('-')[1];
					var found = false;
					$(groups[grpId].applist).each(function() {
						if($(this).get(0) === val1 && $(this).get(1) === val2) found = true;
					});
					if(!found) {
						addSubRow(val1, val2);

						var tmp = new Array();
						tmp.push(val1);
						tmp.push(val2);

						if(groups[grpId].applist == undefined)
							groups[grpId].applist = new Array();

						groups[grpId].applist.push(tmp);
						$(fare1).click();
						$(fare2).click();
					}else {
						$(fare1).click();
						$(fare2).click();
						$('#grp-display-msg').html('this pairing already exists');
					}
				}
			});
			$('#sub-content').prepend($(row));
		}
	});

	$('.sub-header').click(function() {
		$('.sub-header').each(function() {
			$(this).removeClass('active');
		});
		$(this).addClass('active');
		groups[$('#grp-display-id').attr('value')].applicable = $(this).html();
	});
}

$(document).ready(function() {
	var grpSeedId = 30000;
	var fareSeedId = 50000;
	var cnt = 16;
	curGrpId = grpSeedId
	curFareId = fareSeedId

	// load 16 groups for testing
	for(var i = 0; i < cnt; i++)
		addGroupTile();

	// load 32 fares for testing
	for(var i = 0; i < (cnt*2); i++) 
		addFareTile();
	
	init();	
});




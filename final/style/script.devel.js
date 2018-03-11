/*
Copyright (c) 2017 Viktor Chovanec

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/


/*************			DEFINES			*****************/

var game_game_data_file = "./game/data/game.xml";
var game_graphic_base_url = "./game/graphics/fields/";

var game_worspaceselect = "#game";

//var game_objects_notdragable = ['S0','S90','S180','S270','F0','F90','F180','F270','FD0','FD90','FT0','FT90','FT180','FT270'];
//var game_objects_notimportant = ['N','B','E'];

var game_user_history_len	= 3;

var game_user_path_finder = 1;
/*************		WORKING OBJECTS 	*****************/

var game_actualID = -1;

var game_Objects = {};
var game_Games = {};
var game_Games_len = 0;
var game_isplaying = 0;

// Free block movement
var game_cheats = 0;
var game_solutiondevel = 0;
var game_solutioCLICK = 0;

var game_webp_support = 0;



/*
	lastwongame			= 0;
	bestscore[gameid]	= {.0.}

	// GAMEID DEPENDAT, need to be reset after gamechange

	backHistory			= 0;
	move_history		= [];
	score 				= 0;
	userGameLayout 		= null;
	userGameLayoutID 	= -1;
	userGameLayoutHash	= 0;
*/
var game_User = {};


var HUD_event = {
	EVENT_NONE : 0,
	EVENT_HISTORY_BACK : 1,
	EVENT_HISTORY_FORWARD : 2,
	EVENT_SCORE_CHANGE : 3,
	EVENT_BEST_SCORE_CHANGE : 4,
	EVENT_LEVEL_CHANGE : 5,
	EVENT_HISTORY_ADDED : 6,
	EVENT_HISTORY_INVALIDATED : 7
};
var game_HUD_events = {};

/********************************************************/



/**************************		HUD EVENT SYSYEM		******************************/
function engine_HUD_register_event(eventname, func){

	if(eventname)
	{
		if(!game_HUD_events[eventname]) game_HUD_events[eventname] = [];

		game_HUD_events[eventname].push(func);
	}
}

function engine_HUD_run_event(eventname,val)
{
	if(eventname && game_HUD_events[eventname])
	{
		for(var i=0; i < game_HUD_events[eventname].length; i++)
		{
			try{
				game_HUD_events[eventname][i](val);
			} catch(e){
				console.log("[EVENT][FAIL] event function failed");
			}
		}
	}
}
/***************************************************************************************/


function engine_user_forward_history()
{
	if(game_User.backHistory > 0)
	{

		game_User.backHistory--;
		game_User.score++;

		var pos = game_User.move_history.length - game_User.backHistory -1;
		engine_swap_blocks(game_User.move_history[pos][0],game_User.move_history[pos][1]);

		
		
		engine_HUD_run_event(HUD_event.EVENT_HISTORY_FORWARD,game_User.backHistory);
		engine_HUD_run_event(HUD_event.EVENT_SCORE_CHANGE,game_User.score);

		return true;
	}

	return false;
}
function engine_user_pop_history()
{
	if(game_User.backHistory < game_user_history_len)
	{

		var pos = game_User.move_history.length - game_User.backHistory -1;
		engine_swap_blocks(game_User.move_history[pos][1],game_User.move_history[pos][0]);

		//engine_user_push_history(game_User.move_history[pos][1],game_User.move_history[pos][0]);

		game_User.score--;
		game_User.backHistory++;
		
		engine_HUD_run_event(HUD_event.EVENT_HISTORY_BACK,game_User.backHistory);
		engine_HUD_run_event(HUD_event.EVENT_SCORE_CHANGE,game_User.score);

		return true;
	}

	return false;
}

function engine_user_push_history(dragged,dropped)
{
	if(!game_User.move_history) game_User.move_history = [];

	// Uz sa hrabal v historii a spravil zmnenu, takze mazeme historu a zacina sa pisat nova
	if(game_User.backHistory > 0)
	{
		game_User.backHistory = 0;
		game_User.move_history = [];
		engine_HUD_run_event(HUD_event.EVENT_HISTORY_INVALIDATED,0);
	}

	game_User.move_history.push([dragged,dropped]);

	engine_HUD_run_event(HUD_event.EVENT_HISTORY_ADDED,0);
	

	if(game_User.move_history.length > game_user_history_len)
	{
		game_User.move_history = game_User.move_history.slice(1,game_user_history_len+1);
		console.log("[USER][HISTORY] ");
		console.log(game_User.move_history);
	}
}


function engine_swap_blocks(first,second)
{
	var first_elm = document.getElementById(first);
	var second_elm = document.getElementById(second);

	console.log(second_elm);
	if(first_elm && second_elm)
	{
		var buff = first_elm.innerHTML;

		first_elm.innerHTML = second_elm.innerHTML;
		second_elm.innerHTML = buff;
	}

}


function engine_DND_drop(event,ui)
{
	//console.log(ui);

	var draggable = $(ui.draggable);
  	var droppable = $(this);

  	var draggable_pos = draggable.data("pos");
  	var droppable_pos = droppable.data("pos");

  	var draggable_pos_vals = draggable_pos.split("-");
  	var droppable_pos_vals = droppable_pos.split("-");

  	draggable_pos_vals = [parseInt(draggable_pos_vals[0]),parseInt(draggable_pos_vals[1])];
  	droppable_pos_vals = [parseInt(droppable_pos_vals[0]),parseInt(droppable_pos_vals[1])];

  	var acceptable_Pos = [((draggable_pos_vals[0])+"-"+(draggable_pos_vals[1]-1)),
  							((draggable_pos_vals[0])+"-"+(draggable_pos_vals[1]+1)),
  							((draggable_pos_vals[0]-1)+"-"+(draggable_pos_vals[1])),
  							((draggable_pos_vals[0]+1)+"-"+(draggable_pos_vals[1]))];

  	console.log(acceptable_Pos);

  	console.log(draggable_pos + " "+droppable_pos);

  	if(game_cheats || (droppable.find('.game-block-e').length !== 0 && draggable.find('.game-block-e').length === 0))
  	{

  		if(game_cheats || (acceptable_Pos.indexOf(droppable_pos) != -1))
  		{

	  		$('.ui-draggable-dragging').hide();
	  		var droppd = $(ui.draggable).attr('id');

	  		engine_swap_blocks(this.id,droppd);
	  		engine_user_push_history(this.id,droppd);

		    engine_DND_block_changed(draggable,droppable);
		}
  	}

		  


}

function engine_valid_gameid(gameid)
{
	if(gameid >= 0 && gameid < game_Games_len) return true;
	return false;
}

function engine_DND_block_changed(dragged,dropped)
{

	game_valid_user_move();

	game_check_solution();
}

function engine_DND_accept(ui, item) {

			return true;
               /*if(!$(this).hasClass("game-block-e"))
               {
    
               		return false;
               }
               */

               //if($(ui).index()==$(this).index())
                 //return true;
               var $tr =$(this).parent();
               var index = $(this).index();


               if($(ui).is($tr.prev().find('div').eq(index)))
               {
               	//	$(ui).empty();
                   return true;
               }
               
               if($(ui).is($tr.next().find('div').eq(index)))
               {

               		//$(ui).empty();
                   return true;
               }
                  
               var next=$(this).next().get(0);
               var prev=$(this).prev().get(0);
               var me=ui.get(0);

               if(me==next||me==prev)
               return true;

               return false;  
           }

function engine_block_get(name)
{
	if(game_Objects[name]){

		return game_Objects[name];

	} 

	return null;
}

function engine_game_get(gameid)
{
	if(engine_valid_gameid(gameid)){

		return game_Games[gameid];

	} 

	return null;
}

function engine_skip_nonimportant_blocks(solution,gamesolution,size)
{
	var new_sol = "";

	var game_Task_rows = {};
	var game_Task_rows_pseudo = gamesolution.split(";");
	var user_Task_rows = {};
	var user_Task_rows_pseudo = solution.split(";");

	for(var row = 0; row < game_Task_rows_pseudo.length; row++)
	{
		game_Task_rows[row] = game_Task_rows_pseudo[row].split(",");
		user_Task_rows[row] = user_Task_rows_pseudo[row].split(",");
	}


	for(var row=0; row < size.horizontal; row++)
	{
		if(row != 0)
			new_sol += ";";

		for(var column=0; column < size.vertical; column++)
		{
			if(column != 0)
					new_sol += ",";
			if(game_Task_rows[row][column] != "N")
			{
				new_sol += user_Task_rows[row][column];
			} else {
				new_sol += "N";
			}
		}
	}


	return new_sol;

}

function engine_parse_solutions(gameid)
{
	/*var game = engine_game_get(gameid);
	if(game != null)
	{
		var new_solutions = [];
		//console.log(game.solution);
		for(var i=0; i < game.solution.length; i++)
		{
			var solution = engine_skip_nonimportant_blocks(game.solution[i]);
			

			new_solutions.push(solution);
		}
		return new_solutions;
	}
	return null;*/
}

var game_pf_Workspace = {};

function engine_pf_generate_workspace_layout(gamesize)
{
	//if(game_user_path_finder)
	var workspace = $(game_worspaceselect+" .game-block-outer");

	var solution = "";
	for(var i=0; i < workspace.length; i++)
	{
//
		console.log();
		console.log();

		game_pf_Workspace[workspace[i].dataset.pos] = $(workspace[i]).find('.game-block').data("block");

	}
	console.log("[ENGINE][PF][gen_solution] ");
	console.log(game_pf_Workspace);

	//if(game_solutioCLICK) return "test";

	return solution;
}

function engine_generate_solution(gamesize)
{

	var workspace = $(game_worspaceselect+" .game-block");

	var solution = "";
	for(var i=0; i < workspace.length; i++)
	{
		if(i != 0)
		{
			if((i)%gamesize.horizontal == 0)
				solution += ";";
			else 
				solution += ",";
		}

		if(workspace[i].dataset.block/* && game_objects_notimportant.indexOf(workspace[i].dataset.block) == -1*/)
		{ // SOLUTION IMPORTANT
			if(game_solutioCLICK == 1)
			{
				if(workspace[i].dataset.important)
				{
					solution += workspace[i].dataset.block;
				} else {
					solution += "N";
				}
			}
			else
				solution += workspace[i].dataset.block;
		}/* else { // NOT SO MUCH
			solution += "N";
		}*/
	}
	console.log("[ENGINE][gen_solution] "+solution);

	//if(game_solutioCLICK) return "test";

	return solution;
	//console.log(workspace);	
	//game_objects_notimportant
}

function engine_update_HUD(fieldid,value)
{
	var field = document.getElementById(fieldid);
	if(field)
	{
		field.innerHTML = value;
		return true;
	}
	return false;
}

function game_valid_user_move()
{

	console.log("[USER][SCORE]");

	game_User.score++;

	engine_HUD_run_event(HUD_event.EVENT_SCORE_CHANGE,game_User.score);
	
}

function game_validate_solution(gameid,solution)
{
	var game = engine_game_get(gameid);
	if(game != null)
	{
		for(var i=0; i < game.solution.length; i++)
		{
			var check = engine_skip_nonimportant_blocks(solution,game.solution[i],game.size);
			console.log("[GAME][SOLUTION] "+game.solution[i]);
			console.log("[USER][SOLUTION] "+check);
			if(game.solution[i] == check) return true;
		}
	}
	return false;
}

function engine_pf_find_block(blockcode)
{
	var ret = null;
	Object.keys(game_pf_Workspace).forEach(function(key) {


	    if(game_pf_Workspace[key].charAt(0) == blockcode.charAt(0))
	    {
	    	console.log((game_pf_Workspace[key].charAt(0) == blockcode.charAt(0)) + " a toto ");
	    	ret = key;
	    	return key;
	    }
 
	});

	return ret;
}

var pf_start = 'S';
var pf_end = 'F';

function engine_pf_fix_ends(blockindex)
{
	if(game_Objects[blockindex].ends instanceof Array) return game_Objects[blockindex].ends;

	game_Objects[blockindex].ends = game_Objects[blockindex].ends.split(',');

	return game_Objects[blockindex].ends;
}
/*
function engine_pf_gen_next_pos(pos,from)
{
	var arr_pos = pos.split('-');
	var row = parseInt(arr_pos[0]); // row
	var col = parseInt(arr_pos[1]); // col

	switch(from)
	{
		case "1": // aming up, row -1, col same
			return [(row-1)+"-"+col];
		break;
	}

	return null;
}
*/
function engine_pf_next_block_pos(blockway,pos)
{

	var arr_pos = pos.split('-');
	var row = parseInt(arr_pos[0]); // row
	var col = parseInt(arr_pos[1]); // col

	switch(blockway)
	{
		case "1": // aming up, row -1, col same
			return [(row-1)+"-"+col,"1"];
		break;

		case "2": // right
			return [(row)+"-"+(col+1),"2"];
		break;

		case "3": // down
			return [(row+1)+"-"+(col),"3"];
		break;

		case "4": // left
			return [(row)+"-"+(col-1),"4"];
		break;
	}

	return null;
}
/*

function engine_pf_next_block_pos(blockway,pos)
{

	var arr_pos = pos.split('-');
	var row = parseInt(arr_pos[0]); // row
	var col = parseInt(arr_pos[1]); // col

	switch(blockway)
	{
		case "1": // aming up, row -1, col same
			return [(row-1)+"-"+col,"3"];
		break;

		case "2": // right
			return [(row)+"-"+(col+1),"4"];
		break;

		case "3": // down
			return [(row+1)+"-"+(col),"1"];
		break;

		case "4": // left
			return [(row)+"-"+(col-1),"2"];
		break;
	}

	return null;
}

*/
// Change way out for next block to be way in
function engine_pf_rotate_way(way)
{
	switch(way)
	{
		case "1": // aming up, row -1, col same
			return "3";
		break;

		case "2": // right
			return "4";
		break;

		case "3": // down
			return "1";
		break;

		case "4": // left
			return "2";
		break;
	}
	return 0;
}

// check if input comes from right side, + returns output of that block if good block
// otherwise 0
function engine_pf_check_block_input(pos,from)
{


	var block = game_pf_Workspace[pos];

	if(block)
	{
		engine_pf_fix_ends(block);

		// clone it
		var block_ends = game_Objects[block].ends.slice();

		if(block_ends)
		{
			var index = block_ends.indexOf(from);
			if (index > -1) {
			    block_ends.splice(index, 1);
			    return block_ends[0];
			}
		}
	}
	return 0;
}

function engine_pf_validate_pos(pos,gamesize)
{
	var arr_pos = pos.split('-');
	var row = parseInt(arr_pos[0]); // row
	var col = parseInt(arr_pos[1]); // col

	if(!isNaN(row) && !isNaN(col)){
		if(row >=0 && row < gamesize.horizontal && col >= 0 && col < gamesize.vertical)
			return 1;
	}

	return 0;

}

function game_check_solution()
{
	if(engine_valid_gameid(game_actualID))
	{
		var game = engine_game_get(game_actualID);
		if(game != null)
		{
			var solution = engine_generate_solution(game.size);

			console.log("[USER][SOLUTION] "+solution);

			game_User.userGameLayoutHash = game.mapHash;
			game_User.userGameLayout = solution;
			game_User.userGameLayoutID = game_actualID;

			if(game_user_path_finder)
			{
				engine_pf_generate_workspace_layout(game.size);
				var start = engine_pf_find_block(pf_start);
				var end = engine_pf_find_block(pf_end);
				console.log("end at: "+end);
				if(start && end )
				{
					console.log("Start block:");
					engine_pf_fix_ends(game_pf_Workspace[start]);

					var start_obj = game_Objects[game_pf_Workspace[start]];

					
					var act_pos = start;
					var act_way = start_obj.ends[0];
					var next_pos = engine_pf_next_block_pos(act_way,act_pos);
					var goin = 1;

					//act_way = engine_pf_rotate_way(next_pos[1]);

					console.log("Ze zacatku na pos"+next_pos[0]+" smer "+next_pos[1]);

					while(goin == 1)
					{
					console.log("Way in next block = "+engine_pf_rotate_way(next_pos[1]));
					block_out = engine_pf_check_block_input(next_pos[0],engine_pf_rotate_way(next_pos[1]));


					console.log("block out");
					console.log(block_out);

					if(!block_out)
					{
						goin = 0;
						console.log("Zla cesta");
						break;
					}

					next_pos = engine_pf_next_block_pos(block_out,next_pos[0]);
					console.log("Next pos");
					console.log(next_pos);
					//next_pos = engine_pf_next_block_pos(block_out,next_pos[0]);

					if(!engine_pf_validate_pos(next_pos[0],game.size))
					{
						goin = 0;
						break;
					}

					if(next_pos[0] == end) // way point to finish, now check if it is from right way
					{
						var end_ends = engine_pf_fix_ends(game_pf_Workspace[end]);
						console.log("Je na cielovej kocke");


						console.log(end_ends[0]);
						console.log(engine_pf_rotate_way(next_pos[1]));
						if(end_ends[0] == engine_pf_rotate_way(next_pos[1]))
						{
							console.log("Spravna CESTA !!!!!!!!!");
							goin = 2;
						}
							
					}

					
					console.log("Out "+block_out);
					console.log("Dalsi pos"+next_pos[0]+" smer "+next_pos[1]);
					console.log("---------------------------------------------------------------------");
					
						}

					if(goin == 2)
					{
						game_pf_Workspace = {};
						game_user_won(game_actualID);
					}
/*
					while(goin)
					{
						block_out = engine_pf_check_block_input(next_pos[0],engine_pf_rotate_way(next_pos[1]));

						if(block_out && block_out == 0)
						{
							goin = 0;
							console.log("Zla cesta");
						}

						var act_way =(block_out);

						next_pos = engine_pf_next_block_pos(engine_pf_rotate_way(act_way),act_pos);
						console.log("dac:");
						console.log(next_pos);
						act_pos = next_pos[0];

						console.log("nasleduj out: "+block_out);
						console.log(next_pos);

						console.log("Pos");
						console.log(act_pos);

		
					}*/
				}

			}else {
				if(game_validate_solution(game_actualID,solution)) // HE WON, WOW !
				{
					game_user_won(game_actualID);
				} else {

				}
			}

		}
	}
}

function game_user_won(gameid)
{

	if(game_User.score < game_User.bestscore[gameid] || game_User.bestscore[gameid] == 0)
	{
		game_User.bestscore[gameid] = game_User.score;
		engine_HUD_run_event(HUD_event.EVENT_BEST_SCORE_CHANGE,game_User.score);
	}

	

	game_User.lastwongame = gameid+1;

	game_restart_user_data();
	game_save_user();


	if(game_User.lastwongame < game_Games_len)
		$("#gamewon").fadeIn(300);
	else
		$("#gameend").fadeIn(300);

	console.log("[GAME][USER] Won");
	console.log(game_User);
	game_isplaying = 0;
}

function game_user_fill_undefined()
{
	if(!game_User.bestscore) game_User.bestscore = [];

	for(var i=0; i < game_Games_len; i++)
		if(!game_User.bestscore[i])
			game_User.bestscore[i] = 0;

	if(!game_User.score) game_User.score = 0;

	if(!game_User.backHistory) game_User.backHistory = 0;
}

function game_load_user()
{

	if (typeof(Storage) !== "undefined") {
		var data = localStorage.getItem('btwluserDATA');

			console.log(data);

		var jsondata = JSON.parse(data);
		if(data && jsondata)
		{
			game_User = jsondata;
			game_user_data_loaded();
		}
	} else {
	    //TODO ERROR nepodporovane ukladanie
	}
	game_user_fill_undefined();

	if(game_User.move_history && game_User.move_history.length)
	{
		engine_HUD_run_event(HUD_event.EVENT_HISTORY_ADDED,0);
	}

	if(game_User.lastwongame && engine_valid_gameid(game_User.lastwongame))
	{
		game_render_workspace(game_User.lastwongame);
	} else {
		game_render_workspace(0);
	}

}

function game_user_data_loaded()
{
	console.log("[USER] Loaded");
	console.log(game_User);
	//update his last best score
	
}

function game_save_user()
{
	if (typeof(Storage) !== "undefined") {
		localStorage.setItem('btwluserDATA', JSON.stringify(game_User));
	} else {
	    //TODO ERROR nepodporovane ukladanie
	}
}

function game_restart_user_data()
{
	game_User.score = 0;

	game_User.backHistory = 0;
	game_User.move_history = [];

	game_User.userGameLayout = null;
	game_User.userGameLayoutID = -1;
	game_User.userGameLayoutHash = 0;


	engine_HUD_run_event(HUD_event.EVENT_HISTORY_INVALIDATED,0);

}

function game_load_game(file)
{
	$.ajax({
	  type: "GET",
      url: file,
      cache: false,
      dataType: "xml",
	}).done(function( data ) {
		console.log(data);

		// Load all game blocks
		$(data).find('block').each(function(){
				var block_object = {};
					
				var block_name = $(this).find('name').text();
				if(block_name)
				{
					$(this).children().each(function(id,block){
						block_object[$(block)[0].tagName] = $(block)[0].textContent;
					});
					game_Objects[block_name] = block_object;
				}
        });

		console.log(game_Objects);

		// Load all games
		var arr_Params = ['solution'];
		$(data).find('game').each(function(id,block){

			var game_object = {};
			//console.log($(block));
			$(block).children().each(function(id,block){
				var obj = $(block);

				//console.log(obj.children().length);

				if(obj.children().length == 0)	// Mans not hot
				{
					//console.log(obj);
					//obj = $(obj)[0];
					if(arr_Params.indexOf(obj[0].tagName) != -1) // This params gona be array
					{
						if(!game_object[obj[0].tagName]) 	game_object[obj[0].tagName] = [];

						game_object[obj[0].tagName].push(obj[0].textContent);
					} else {
						game_object[obj[0].tagName] = obj[0].textContent;
					}
				} else {	// But here ting go skraa pa pa pa ka ka
					var sub_obj = {};
					obj.children().each(function(id,block){
						var obj = $(block)[0];
						sub_obj[obj.tagName] = obj.textContent;
					});
					game_object[obj[0].tagName] = sub_obj;
				}
				//console.log(obj.tagName);
			});

			

			if(game_object.task)
			{
				game_object.mapHash = game_object.task.hashCode();
			}

			game_Games[id] = game_object;
			game_Games_len++;
        });



		console.log(game_Games);

		game_status_DATALOADED();
	});
}


function game_status_DATALOADED()
{

	if(game_Games_len > 0)
	{
		/*
			Nespoliehame sa na vstup s .xml suboru, takze spravime spravne riesenia podla
			nasich poziadaviek
		*/
		/*for(var gmid = 0; gmid < game_Games_len; gmid++)
		{
			var solution = 	engine_parse_solutions(gmid);
			game_Games[gmid].solution = solution;
		}*/


		game_load_user();
	}
}


function game_render_workspace(gameid)
{
	if(!game_Games[gameid])
	{
		// TODO ERROR Game with that ID not avilable

		return;
	}


	game_actualID = gameid;

	var game = game_Games[gameid];

	//game_User.score = 0; // skore pre aktualnu hru momentalne neukladame
	engine_HUD_run_event(HUD_event.EVENT_SCORE_CHANGE,game_User.score);


	engine_HUD_run_event(HUD_event.EVENT_BEST_SCORE_CHANGE,game_User.bestscore[gameid]);
	

	console.log(game);

	var	horizontal = parseInt(game.size.horizontal);
	var	vertical = parseInt(game.size.vertical);
	if(isNaN(horizontal) || isNaN(vertical))
	{
		// TOTO ERROR Game has wrong size config
		return;
	}

	game.size.horizontal = horizontal;
	game.size.vertical = vertical;

	var gameTask = game.task;
/****************************		CHECKIN IF USER GOT THIS GAME SAVED 	******************************************/
	
	if(game_User.userGameLayoutID == gameid && game_User.userGameLayout && game.mapHash == game_User.userGameLayoutHash)
	{
		gameTask =	game_User.userGameLayout;

	}
/********************************************************************************************************************/
	var game_Task_rows = {};
	var game_Task_rows_pseudo = gameTask.split(";"); // Seriously ?!

	for(var row = 0; row < game_Task_rows_pseudo.length; row++)
	{
		game_Task_rows[row] = game_Task_rows_pseudo[row].split(",");
	}


	console.log(game_Task_rows);
	// Ok now we can generate workboard
	var game_workbench = '<div id="resp-table"><div id="resp-table-body">';	// This might irritate someone, so;

	for(var row=0; row <horizontal; row++)
	{
		game_workbench += '<div class="resp-table-row">';
		for(var column=0; column <vertical; column++)
		{
			var block = engine_block_get(game_Task_rows[row][column]);
			var dragable = "is-dragable";
			if(block != null)
			{
				if(block.dragable == "0") dragable = "not-dragable";
				//if(game_objects_notdragable.indexOf(block.name) != -1) dragable = "not-dragable";
				game_workbench += '<div id="game-block-'+row+''+column+'" class="game-block-outer table-body-cell game-cols-'+vertical+' '+dragable+'" data-pos="'+row+"-"+column+'"><div data-block="'+block.name+'" class="game-block game-block-'+block.name.toLowerCase()+'">';
				game_workbench += '<img alt="'+block.name+'" class="rot'+block.rotation+'" src="'+game_graphic_base_url+block.img+'" >';
				game_workbench += '</div></div>';

			} else{
				console.log("INVALID BLOCK");
				console.log(game_Task_rows[row][column]);
				// TODO ERROR invalid block in game file, fix it
			}
		}
		game_workbench += '</div>';
	}
	game_workbench += '</div></div>';


	$(game_worspaceselect).html(game_workbench);


	$("#resp-table #resp-table-body .resp-table-row .is-dragable").draggable({
                appendTo: "body",
                helper: 'clone',
                cursor: "move",
                revert: true,
                opacity: 0.5
            });
 
            
    $('#resp-table-body .resp-table-row .is-dragable').droppable({
           	accept: engine_DND_accept,
           	hoverClass: 'hovered',
          	drop:engine_DND_drop
       		});  


    if(game_User.bestscore[game_actualID])
		engine_HUD_run_event(HUD_event.EVENT_BEST_SCORE_CHANGE,game_User.bestscore[game_actualID]);

	game_isplaying = 1;

	engine_HUD_run_event(HUD_event.EVENT_LEVEL_CHANGE,gameid);

/*
	game_Task_rows.forEach(function(data,id){

		console.log(data);

	});	
*/



	//

}

function game_user_restart()
{
	game_restart_user_data();

	game_render_workspace(game_actualID);
}


function game_orientation()
{
	if(screen.orientation.type.match(/\w+/)[0] == "landscape")
	{
		$("body").removeClass("portrait");
		$("body").addClass("landscape");
	} else {
		$("body").addClass("portrait");
		$("body").removeClass("landscape");
	}
}

$( document ).ready(function() {

      // LOADING BASE GAME DATA
      $("#restartGame").click(function(e){
      	if(game_isplaying)
      	{
      		game_user_restart();
      		$("#gamerestart").fadeIn(200,function(){
      			$("#gamerestart").fadeOut(800);	
      		});
      	}
      });
      $("#saveGame").click(function(e){
      	game_save_user();

      	$("#gamesaved").fadeIn(200,function(){
      		$("#gamesaved").fadeOut(800);	
      	});
      });

      $("#editsettings").click(function(e){

      	var scorevalin = document.getElementById("valbstscr");
      	var lvlslct = document.getElementById("gameselect");

      	if(scorevalin)
      	{
      		if(game_User.bestscore[game_actualID])
      			scorevalin.value = game_User.bestscore[game_actualID];
      		else
      			scorevalin.value = 0;
      	}

      	if(lvlslct)
      	{
      		var opts = "";
      		for(var i=0; i < game_Games_len; i++)
      		{
      			opts += "<option "+(i == (game_actualID) ? "selected": "")+" value='"+i+"'>Kolo "+(i+1)+"</option>";
      		}
      		lvlslct.innerHTML = opts;
      	}

      	$("#gamesettings").fadeIn(300);
      });


      
      
    $("#closesettings").click(function(e){
			$("#gamesettings").fadeOut(300);
	});

	$("#savesettings").click(function(e){

		var scorevalin = document.getElementById("valbstscr");
      	var lvlslct = document.getElementById("gameselect");

      	if(scorevalin)
      	{
      		var val = parseInt(scorevalin.value);
      		if(!isNaN(val) && val != game_User.bestscore[game_actualID])
      		{
      			game_User.bestscore[game_actualID] = val;
      			engine_HUD_run_event(HUD_event.EVENT_BEST_SCORE_CHANGE,val);
      		}

      	}
      	if(lvlslct)
      	{
      		var selval = parseInt(lvlslct.options[lvlslct.selectedIndex].value);
      		if(!isNaN(selval) && engine_valid_gameid(selval) && selval != game_actualID)
      		{
      			game_actualID = selval;
      			game_User.lastwongame = selval;

      			game_user_restart();


      		}
      	}
      	game_save_user();
		$("#gamesettings").fadeOut(300);

	});

	$("#nextround,#gamewon").click(function(e){

		if(engine_valid_gameid(game_User.lastwongame))
		{
			game_actualID = game_User.lastwongame;

			game_user_restart();
			$("#gamewon").fadeOut(300);
		}

	});

	$("#newgame,#gameend").click(function(e){
		if(engine_valid_gameid(0))
		{
			game_actualID = 0;

			game_user_restart();
			$("#gameend").fadeOut(300);
		}
	});

	$("#goback").click(function(e){
		console.log("go back");
		engine_user_pop_history();
	});

	$("#goforward").click(function(e){

		console.log("go further");
		engine_user_forward_history();
	});

	$("#showhelp").click(function(e){

		$("#gamehelp").fadeIn(300);
	});

	$("#gamehelp,#closehelp").click(function(e){

		$("#gamehelp").fadeOut(300);
	});

		
	engine_HUD_register_event(HUD_event.EVENT_SCORE_CHANGE,function(val){
		engine_update_HUD("score",val);
		console.log("score changed");
	});

	engine_HUD_register_event(HUD_event.EVENT_BEST_SCORE_CHANGE,function(val){
		engine_update_HUD("bestscore",val);
		console.log("bestscore changed");
	});

	engine_HUD_register_event(HUD_event.EVENT_LEVEL_CHANGE,function(val){
		engine_update_HUD("gameprogress",(val+1)+"/"+game_Games_len);
		console.log("level changed");

		if(game_solutiondevel)
		{
			$(".game-block").click(function(e){
				if(game_solutioCLICK)
				{
					this.dataset.important = 1;
				}
			});
		}
	});

	engine_HUD_register_event(HUD_event.EVENT_HISTORY_ADDED,function(val){
		$("#goback").removeClass("disabled");
		console.log("history added");
	});

	engine_HUD_register_event(HUD_event.EVENT_HISTORY_BACK,function(val){
		$("#goforward").removeClass("disabled");

		if(val == game_User.move_history.length)
		{
			$("#goback").addClass("disabled");
		}
		console.log("history went back");
	});

	engine_HUD_register_event(HUD_event.EVENT_HISTORY_FORWARD,function(val){
		$("#goback").removeClass("disabled");

		if(val == 0)
		{
			$("#goforward").addClass("disabled");
		}
		console.log("history went forward");
	});


	engine_HUD_register_event(HUD_event.EVENT_HISTORY_INVALIDATED,function(val){

		console.log("history invalidated");

		if(val == 0)	// Deleted whole history after restart of game etc.
		{
			$("#goback").addClass("disabled");
			$("#goforward").addClass("disabled");
		} else if(val == 1){ // user did move while in history, so he cant go forward anymore
			$("#goforward").addClass("disabled");
		}
	});

	game_orientation();

	var today = new Date();
	var day = today.getDate();
	var mnth = today.getMonth()+1;
	var yr = today.getFullYear();

	var date = ((day< 10) ? ("0" + day) : day) +'.'+((mnth< 10) ? ("0" + mnth) : mnth)+". "+yr;

	$("#date").html(date);

    game_load_game(game_game_data_file);
});


$( window ).on( "orientationchange", function( event ) {
	  
	 	game_orientation();	
    
	});


	/*
	https://stackoverflow.com/questions/10614481/disable-double-tap-zoom-option-in-browser-on-touch-devices
	*/
	(function($) {
		  $.fn.nodoubletapzoom = function() {
		      $(this).bind('touchstart', function preventZoom(e) {
		        var t2 = e.timeStamp
		          , t1 = $(this).data('lastTouch') || t2
		          , dt = t2 - t1
		          , fingers = e.originalEvent.touches.length;
		        $(this).data('lastTouch', t2);
		        if (!dt || dt > 500 || fingers > 1) return; // not double-tap

		        e.preventDefault(); // double tap - prevent the zoom
		        // also synthesize click events we just swallowed up
		        $(this).trigger('click').trigger('click');
		      });
		  };
		})(jQuery);


//**********************************************************************//
//http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/

String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
}

var w;
var end = 0;

var result;
var primes;
var outType = 0;
var pos = 0;
var endText = "";

function show_err(text,field,errorfield)
{
	errorfield.text(text);
	if(field != null) field.addClass("error");
	errorfield.fadeIn(200);
}

function startCalculation()
{
	var	startInp = $("#start");
	var endInp = $("#end");
	var error = $("#error-msg");

	var startVal;
	var endVal;

	if(!startInp || !endInp) return 0;

	startVal = parseInt(startInp.val());
	endVal = parseInt(endInp.val());

	error.hide();
	startInp.removeClass("error");
	endInp.removeClass("error");

	if(isNaN(startVal))
	{
		show_err("Je potrebné zadať číselnú hodnotu!",startInp,error);
		return 0;
	}

	if(startVal < 1)
	{
		show_err("Najmenšia počiatočná hodnota je 1!",startInp,error);
		return 0;
	}

	if(isNaN(endVal))
	{
		show_err("Je potrebné zadať číselnú hodnotu!",endInp,error);
		return 0;
	}

	if(endVal < 1)
	{
		show_err("Najmenšia konečná hodnota je 1!",endInp,error);
		return 0;
	}

	if(startVal > endVal)
	{
		show_err("Zadaný rozsah nespĺňa podmienku začiatok <= koniec!",startInp,error);
		return 0;
	}


    if (typeof(Worker) !== "undefined") {
    
	    w = new Worker("./style/calculate.js");

	    w.onmessage = function(event){
	    	var actual = event.data[1];
	    	
			result = document.getElementById("calculatin");
			primes = document.getElementById("primes");

			var res = Math.round(((actual-startVal)/(endVal-startVal))*10000)/100;
			if(isNaN(res)) res = 100;

	    	result.innerHTML = "<span>"+(res.toFixed(2))+"%</span>";
	    	
	    	if(pos == 0) primes.innerHTML = "";

	    	if(event.data[0])
	    	{
	    		pos++;
	    		switch(outType)
	    		{
	    			case "pt":
	    			{
	    				if(pos == 1) 
	    				{
	    					primes.innerHTML = "";
	    					endText = "";
	    				}
	    				else primes.innerHTML += " ";
	    				primes.innerHTML += actual;


	    				break;
	    			}

	    			case "ja":
	    			{
	    				if(pos == 1)
	    				{
	    					primes.innerHTML = "var primes=[";
	    					endText = "];";
	    				}
	    				else primes.innerHTML += ", ";
	    				primes.innerHTML += actual;

	    				break;
	    			}

	    			case "jo":
	    			{
	    				if(pos == 1)
	    				{
	    					primes.innerHTML = "[";
	    					endText = "]";
	    				}
	    				else primes.innerHTML += ", "; 
	    				primes.innerHTML += "\""+actual+"\"";

	    				break;
	    			}
	    		}
	    		/*if(pos%10 == 0 && pos)
	    		{
	    			primes.innerHTML += '\n';
	    		}*/
	    	}

	    	if(actual < endVal)
	    	{
	    		w.postMessage(actual+1);
	    	} else {
	    		//
				primes.innerHTML = "<h2>Prvočísla v rozsahu < "+startVal+" , "+endVal+" > sú v počte "+pos+".</h2><textarea class='txtar'>"+primes.innerHTML+endText+"</textarea>";
	    		
	    		primes.innerHTML += '<br><button name="odoslat" value="Odoslať formulár" onclick="showStart();">Nový výpočet</button>';

	    		$("#calculatin").fadeOut(300,function(){
	    			$("#primes").fadeIn(300);	
	    		});

	    		
	    	}
	    };

	    //switch()
		
		outType = $("input[name=outputtype]:checked").val();


	    $("#inptform").slideUp(400);
    	$("#calculatin").slideDown(400,function(){

    		pos = 0;
	    	w.postMessage(startVal);

    	});

	} else {
		show_err("Váš prehliadač nepodporuje funkcionalitu potrebnú pre spustenie výpočtu!",null,error);
	}


}

function showStart(){

	$("#primes").fadeOut(500,function(){

	$("#inptform").fadeIn(500);
	});
}
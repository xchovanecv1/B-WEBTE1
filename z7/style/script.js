
var source = null;
var count = 0;
var visibility = [[true],[true]];
var grphfield = null;
function createSauce(field)
{
 
if(typeof(EventSource) !== "undefined") {
    source = new EventSource("http://vmzakova.fei.stuba.sk/sse/sse.php");
    grphfield = field;
    source.addEventListener("message", function(e) {
        var data = JSON.parse(e.data);
        console.log(data)
        if(count == 0)
        {
        		var layout = {
			  title: 'Meranie napätia fáz na motore so synchrónnym štartom',
			  xaxis: {
			    title: 'Frekvencia vzorkovania [GS/s]',
			    titlefont: {
			      family: 'Courier New, monospace',
			      size: 18,
			      color: '#7f7f7f'
			    }
			  },
			  yaxis: {
			    title: 'Napätie [kV]',
			    titlefont: {
			      family: 'Courier New, monospace',
			      size: 18,
			      color: '#7f7f7f'
			    }
			  }
			};
        	Plotly.plot(field, [{
        	  x: [data.x],
			  y: [(data.y1)],
			  mode: 'lines',
			  name: 'Channel 1',
			  line: {color: '#80CAF6'}
			}, {
			  x: [data.x],
			  y: [(data.y2)],
			  mode: 'lines',
			  name: 'Channel 2',
			  line: {color: '#DF56F1'}
			}],layout);
        } else {
        	 Plotly.extendTraces(field, {
        	 	x: [[data.x],[data.x]],
			    y: [[data.y1], [data.y2]]
			  }, [0, 1])

        }
        count++;
		
			}, false);
  
} else {
    document.getElementById(field).innerHTML = "Sorry, your browser does not support server-sent events...";
}

}

function alterTracesVisibility(traceid)
{
	if(grphfield != null)
	{
		if(visibility[traceid])
		{
			visibility[traceid] = false;
		} else {
			visibility[traceid] = true;
		}

		Plotly.restyle(grphfield, {visible: visibility[traceid]}, [traceid]);
	}
}


function endCapture()
{
	if(source != null)
	{
		source.close();
		$("#endCapt").slideUp(300);
	}
}


$( document ).ready(function() {


	createSauce('graph');

	$("#track1").click(function(e){
		alterTracesVisibility(0);
	});
	$("#track2").click(function(e){
		alterTracesVisibility(1);
	});


});
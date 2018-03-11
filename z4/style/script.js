

var images = [];
var gallery = null;
var gallery_img = null;

var base_url = "./style/";

console.log(base_url);

var xhttp = new XMLHttpRequest();
xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
       var photos = JSON.parse(xhttp.responseText);

       images = photos["photos"];

       var photBox = document.getElementById("photos");
       var counter = 0;
       photos["photos"].forEach(function(photo) {
       		var extra_class = "";
       		photBox.innerHTML += '<a href="./style/'+photo["src"]+'" data-id="'+(counter++)+'" class="preview"><img src="./style/'+photo["prew"]+'" alt="'+photo["description"]+'"></a>';
       		//console.log(photo);
       });
       var children = photBox.children;


       gallery = document.getElementById("photobox");
       gallery.onclick = function(){
          this.style.display = "none";
          toggleTimer(1);

       };

       gallery_img = document.getElementById("box_photo");
       console.log(gallery_img);
       gallery_img.onclick = function(e){
          e.stopPropagation();

       }

       for (var i = 0; i < children.length; i++) { // iterate over it
		    children[i].onclick = function (e) {   // attach event listener individually
		        return openPic(this,gallery,gallery_img);
		    }
		}


       //console.log(photos["photos"]);
    }
};
xhttp.open("GET", "./style/photos.json", true);
xhttp.send();


function openPic(field,gallery,img,id = -1)
{
  var max_scale = 0.75;

  var img_desc = document.getElementById("img-desc");
  var img_name = document.getElementById("img-name");
  var img_desc_block = document.getElementById("desc-outer");

  var img_id;
  if(id == -1)
    img_id = field.getAttribute("data-id");
  else 
    img_id = id;

    var imgd = new Image();


    img.src = "./style/loading.svg";
    //img.style ="width:300px; height:300px;";

    imgd.onload = function () { 

      var style = "";

      var win_height = document.body.clientHeight;
      var win_width = document.body.clientWidth;

      var scaled_height = win_height * max_scale;
      var scaled_width = win_width * max_scale;

      console.log(scaled_height + " " + scaled_width);

      var height = imgd.height;
      var width = imgd.width;

      var final_height = 0;
      var final_width = 0;


      // PORTRET
      if(height > width)
      {
        //
        if(height > win_height)
        {

          final_height = scaled_height;
          final_width = width*(final_height/height);
          //style =  "height: "+final_height+"px;";
          //style += "width: "+final_width+"px";
        } else {

          final_height = height;
          final_width = width;
          
        }

      } else { // Landscape
        if(width > win_width)
        {

          final_width = scaled_width;
          final_height = height*(final_width/width);
          //style =  "height: "+final_height+"px;";
          //style += "width: "+final_width+"px";
        } else {

          final_height = height;
          final_width = width;
          
        }
      }

      style =  "height: "+final_height+"px;";
      style += "width: "+final_width+"px";

    /*
      

      if(height > win_height)
      {
        final_height = scaled_height;
        final_width = scaled_width;
        style =  "height: "+scaled_height+"px;";
        style += "width: "+scaled_width+"px";
      } else if(width > win_width)
      {
        final_height = scaled_height;
        final_width = scaled_width;
        style =  "height: "+scaled_height+"px;";
        style += "width: "+scaled_width+"px";
      } else {
        final_height = height;
        final_width = width;

        style =  "height: "+height+"px;";
        style += "width: "+width+"px";
      }
*/
      img.style = style;
      img.parentElement.style = style;
      img.src = imgd.src;
      img.setAttribute('data-id',img_id);
      img.alt = images[img_id]["description"];

      style = "min-height: "+final_height/2+"px; width: "+ (final_width-50)+"px; ";

      img_desc_block.style = style;
      
      img_desc.innerHTML = images[img_id]["description"];
      img_name.innerHTML = images[img_id]["title"];
      //desc.innerHTML = "<span class='img-name'>"+images[img_id]["title"]+"</span>"+;

      gallery.style.display = "block";

    };

    if(field != null)
      imgd.src = field.href;
    else
    {
      console.log(img_id);
      imgd.src = base_url+images[img_id].src;
    } 

	return false;
}

function change_pic(act)
{
  // next
  gallery_img = document.getElementById("box_photo");
  var img_id = parseInt(gallery_img.getAttribute("data-id"));


  console.log(img_id + " act: "+act);
  var next = 0;

  
  var next = 0;

  if(act > 0) next = img_id+1;
  else next = img_id-1;


  console.log(images.length);

  if(next < 0) next = images.length-1;
  if(next >= images.length) next = 0;

  console.log(img_id + " - " + next);

  return openPic(null,gallery,gallery_img,next);
}

var slide_enabled = 0;

function slideshow()
{
  if(slide_enabled)
  {
    //console.log("test");
    change_pic(1);
  }
}

var timer = null;

function toggleTimer(stop = 0)
{
  if(timer != null || stop )
    {
      clearInterval(timer);
      slide_enabled = 0;
      timer = null;
    } else {
      slide_enabled = 1;
      timer = setInterval(slideshow, 2000);
    }
}

document.addEventListener("DOMContentLoaded", function(event) { 

  var next = document.getElementById("next");
  var prev = document.getElementById("prev");
  var slide = document.getElementById("slide");

  next.onclick = function(e){
    e.stopPropagation();
    return change_pic(1);
  }

  prev.onclick = function(e){
    e.stopPropagation();
    return change_pic(-1);

  }

  slide.onclick = function(e){
    e.stopPropagation();
    toggleTimer();
    return false;

  }
});

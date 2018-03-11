var startTag = "<span class='mark'>";
var endTag = "</span>";
var inputID = "srh";
var searchAreaID = "search";

window.onload = function(){

document.getElementById(inputID).addEventListener('input', function (evt) {

        var children = document.getElementById(searchAreaID).childNodes;
        if(this.value.length > 2)
        {
          for(var i=0; i < children.length; i++)
          {
            var out = children[i].textContent;
            var pos =out.indexOf(this.value);
            
            while(pos !== -1)
            {
                out = [out.slice(0, pos), startTag, out.slice(pos)].join('');
                
                pos += startTag.length + this.value.length;
                out = [out.slice(0, pos), endTag, out.slice(pos)].join('');
                pos += endTag.length;

                pos = out.indexOf(this.value, pos + 1);
            }

            children[i].innerHTML = out;
          }
        } else {

          for(var i=0; i < children.length; i++)
          {
              children[i].innerHTML = children[i].textContent;
          }

        }
});

  
}

// Naposledy ukazana variacia ktoru skryjeme ked showneme novu
  var shown_var = null;

function field_ok(field)
{
  var err_sp = document.getElementById(field.id+"-er");
  if(err_sp && field)
  {
    field.style.border = "";

    err_sp.innerHTML = "";
    err_sp.style.display = "none";
  }
}

function field_error(field,text)
{

  var err_sp = document.getElementById(field.id+"-er");

  if(err_sp && field)
  {
    field.style.border = "red 2px solid";

    err_sp.innerHTML = text;
    err_sp.style.display = "block";
  }
}

function field_act(field,test=false)
{
  var type = field.getAttribute("data-val");
  if(type == null) return true;

  var depends = field.getAttribute("data-depend");
  //Ked chceme aby to editovalo nejaky field
  var change = field.getAttribute("data-change");


  var depend_field = null;
  if(depends)
  {
    depend_field = document.getElementById(depends);
  }

  var change_field = null;
  if(change)
  {
    change_field = document.getElementById(change);
  }

  switch(type)
  {
    case "age":
    {
      if(depend_field)
      {
        if(depend_field.value)
        {
          var birtYear = new Date(Date.parse(depend_field.value));
          var today = new Date();
          var ageDate = new Date(today-birtYear); // miliseconds from epoch
          var age = Math.abs(ageDate.getUTCFullYear() - 1970);

          if(age != field.value)
          {
            // TODO error
            field_error(field,"Zadaný vek nezodpovedá dátumu narodenia!");
            return false;
          } else {
            field_ok(field);
            return true;
          }
        } else {
          field.value = "";
          field_error(depend_field,"Je potrebné vyplniť dátum narodenia!");
          // TODO , Warning, treba vyplnit datum narodenia
          return false;
        }
        
      }
      return false;
    }

    case "toggle":
    {
      // Pocas validacie vraciame ze sa jedna o spravnu hodnotu
      if(test) return true;

      if(change_field)
      {
        if(field.checked)
        {
          change_field.style.display = "inline-block";
        } else {
          change_field.style.display = "none";
        }
      }
      return true;
    }

    case "show":
    {
      // Pocas validacie vraciame ze sa jedna o spravnu hodnotu
      if(test) return true;

      if(change_field)
      {
        change_field.style.display = "block";
      }
      return true;
    }

    case "show_var":
    {
      // Pocas validacie vraciame ze sa jedna o spravnu hodnotu
      if(test) return true;

      if(change_field)
      {
        if(shown_var)
        {
          shown_var.style.display = "none";
        }
        shown_var = change_field;
        change_field.style.display = "block";
      }
      return true;
    }

    case "hide_var":
    {
      // Pocas validacie vraciame ze sa jedna o spravnu hodnotu
      if(test) return true;

      if(shown_var)
      {
        shown_var.style.display = "none";
      }
      shown_var = null;

      return true;
    }

    case "hide":
    {
      // Pocas validacie vraciame ze sa jedna o spravnu hodnotu
      if(test) return true;

      if(change_field)
      {
        change_field.style.display = "none";
      }
      return true;
    }

    case "email":
    {
      if(!(/(.+)@(.+){2,}\.[a-zA-z]{2,7}$/.test(field.value)))
      {
        field_error(field,"Zadaný emial nespĺňa formát!");
        return false;
      }
      field_ok(field);
      return true;
    }

    case "phone":
    {
      
      if(!field.value || 0 === field.length)
      {
        console.log(field.value);
        field_ok(field);
        console.log("done");
        return true;
      }

        console.log("donse");
      if(!(/^\+?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{3})[-. ]?([0-9]{3})$/).test(field.value))
      {
        field_error(field,"Telefónne číslo bolo zadané v zlom formáte!");
        return false;
      }
      field_ok(field);
      return true;
    }

    case "date":
    {
      if(!(/^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/).test(field.value))
      {
        field_error(field,"Dátum bol zadaný v zlom formáte!");
        return false;
      }
      field_ok(field);
      return true;
    }

  }

  return false;

}

  var levels = [];
  var unis ={
    none: {
      none:{name:"---", lvls:[]}, 
    },
    stu: {
      none:{name:"---", lvls:[]}, 
      fei:{name:"Fakulta elektrotechniky a informatiky", lvls:["Bakalárske štúdium","Inžinierske štúdium", "Doktorandské štúdium"]},
      fiit:{name:"Fakulta informatiky a informačných technológií", lvls:["Bakalárske štúdium","Inžinierske štúdium", "Doktorandské štúdium"]}
    },
    uk: {
      none:{name:"---", lvls:[]}, 
      lf:{name:"Lekárska fakulta", lvls:["Štúdium spojeného 1. a 2. stupňa", "Doktorandské štúdium"]},
      pf:{name:"Právnická fakulta", lvls:["Bakalárske štúdium","Inžinierske a Magisterskě štúdium", "Doktorandské štúdium"]}
    },
    pae: {
      none:{name:"---", lvls:[]}, 
      fm:{name:"Fakulta masmédií", lvls:["Bakalárske štúdium","Inžinierske a Magisterskě štúdium", "Doktorandské štúdium"]},
      fp:{name:"Fakulta psychológie", lvls:["Bakalárske štúdium","Inžinierske a Magisterskě štúdium", "Doktorandské štúdium"]}
    }
  };

function level_select(field,level)
{
  var change = field.getAttribute("data-change");
  var change_field = null;
  if(change)
  {
    change_field = document.getElementById(change);
  }

  switch(level)
  {
    case 0:
    if(change_field)
    {
      var val = field.value;
      if(val in unis)
      {
        var outer = document.getElementById(change+"-outer");

        levels[0] = val;
        //var outer = document.getElementById(change+"-outer");
        //levels[1]
        if(outer) 
        {
          if(val != "none") outer.style.display = "block";
             else outer.style.display = "none";
        }
        
        // premazeme select
        change_field.innerHTML = "";
        Object.keys(unis[val]).forEach(function(key){

          var opt = document.createElement('option');
          opt.value = key;
          opt.text = unis[val][key]['name'];
          change_field.appendChild(opt);

        });
        //alert("parada");
      }
    }
    break;

    case 1:
    if(change_field && levels[0])
    {
      var val = field.value;
      if(val in unis[levels[0]])
      {
          var outer = document.getElementById(change+"-outer");
          if(outer) 
          {
             if(val != "none") outer.style.display = "block";
             else outer.style.display = "none";
          }
          // premazeme select
          levels[1] = val;
          change_field.innerHTML = "";
          Object.keys(unis[levels[0]][val]['lvls']).forEach(function(key){

            var opt = document.createElement('option');
            opt.value = key;
            opt.text = unis[levels[0]][val]['lvls'][key];
            change_field.appendChild(opt);

          });
      }
    }  
    break;

  }
}

function val_form(form)
{

  var fieldtags= ['input', 'textarea', 'select', 'button'];
  
  for (var tagi= 0; tagi < fieldtags.length; tagi++) {
    var fields= form.getElementsByTagName(fieldtags[tagi]);
    for (var fieldi= 0; fieldi < fields.length; fieldi++) {
        if(fields[fieldi].required)
        {
          if(!fields[fieldi].value)
          {
            field_error(fields[fieldi],"Toto pole je povinné!");
            return false;
          } else {
            field_ok(fields[fieldi]);
          }
        }
        
        if(fields[fieldi].dataset['val'])
        {
          if(!field_act(fields[fieldi],true))
          {
            return false;
          }
        }     
    }
  }

  return true;
}


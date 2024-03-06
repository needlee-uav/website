function switch_nav(nav_option) {
    var nav_options = window.document.getElementsByClassName('nav-option');
    for(var i = 0; i < nav_options.length; i++) {
        nav_options[i].style = "display: none;";
    }
    console.log(nav_option)
    window.document.getElementById(nav_option).style = "display: inline";
}

$(document).ready(function() {
    document.getElementById('navbar-brand-home').onclick = function(e) { switch_nav("home"); }
    var nav_options = document.getElementsByClassName('nav-item');
    for(var i = 0; i < nav_options.length; i++) {
        var nav_option = nav_options[i];
        nav_option.onclick = function(e) {
            switch_nav(e.target.name);
        }
    }
});
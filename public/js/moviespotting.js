var selectize;
$(document).ready(function(){

  $("#signupMessageBlock").hide();
  if($('#movieName').length > 0){
    checkNewActivity();
    initAutocomplete();
    initCreateMovie();
    //$("[data-toggle=dropdown]").dropdown();
  }
  $("[data-toggle=tooltip]").tooltip();

  //$('#select-state').append("<option value='something'>something</option>");
  var $select = $('#select-tags');

  if($select.length>0){
    $select.selectize({
      persist: true,
      create: function(input) {
          return {
              value: input,
              text: input
          }
      }
    });
    selectize = $select[0].selectize;
  }
  //selectize.options["hello"]={value:"hello",text:"hello"};

});

function checkNewActivity(){
  $.ajax({
    url: '/user/checknewactivity'
  }).done(function(result){
      if(parseInt(result.length) > 0 ){
        var activityCountElem = $("#activityCount");
        activityCountElem.html(result.length);
        activityCountElem.removeClass("hide");
      }
  });
}

function clearNewActivities(){
  var activityIds = [];
  $("#activityStream .comment span[data-activity-new='y']").each(function(index) {
    activityIds.push($(this).data("activity-id"));
  });
  if(activityIds.length > 0 ){
    $.ajax({
      url: '/user/clearnewactivity',
      data: {
        activityIds: activityIds.join(",")
      }
    }).done(function(result){

      $("#activityStream .comment span[data-activity-new='y']").each(function(index) {
        $(this).remove();
      });
      $("#activityCount").remove();
    });
  }
}



$("#signUpForm").submit(function(evt){

  if($(this).attr("action") == "/usersignup"){
    evt.preventDefault();
    var form = $(this)
       ,userDisplayName = form.find('input[name="userdisplayname"]').val()
       ,userEmail = form.find('input[name="useremail"]').val()
       ,password = form.find('input[name="password"]').val()
       ,url = form.attr("action")
       ,signupMessageBlock  = $("#signupMessageBlock")
       ,signupMessage = $("#signupMessage");

    if(userDisplayName === "" || userEmail === "" || password === ""){
      signupMessageBlock.removeClass("alert-success");
      signupMessageBlock.addClass("alert-error");
      signupMessage.html("Please fill in all the fields");
      signupMessageBlock.show();
    }
    else{
      var userData = {
        userdisplayname: userDisplayName,
        useremail: userEmail,
        password: password

      };
      $.post(url,userData).done(function(data){

        signupMessage.html(data.message);
        loginAfterSignUp();
      });
    }
  }
});

$("#feedbackForm").submit(function(evt){
  evt.preventDefault();
  $("#feedbackModal").modal('hide');
  showToast("Thanks for your feedback, we really appreciate you taking time for it !!");
  $.post('/feedback',$("#feedbackForm").serialize());
});

function loginAfterSignUp(){

  $signUpForm = $("#signUpForm");
  $signUpForm.attr("action","/userlogin");
  $signUpForm.find("input[name='useremail']").attr('name','username');
  $signUpForm.submit();
}

function initCreateMovie(){

  $("#createMovieModal #createMovieFormBtn").addClass("disabled");
  $("#createMovieModal #createMovieFormBtn").attr("disabled","disabled");
  $('#movieSummaryBlock').on("change","#useSummaryChk",function(evt){
    if(this.checked){
      $("#userDefinedSummary").attr("value",$("#mdbSummary").html().trim()); 
    }
    else{
      $("#userDefinedSummary").attr("value",""); 
    }
  });
}
/*################ JS for index page ##############*/

// intializing autocomplete element on index page
var flag = true;
function initAutocomplete(){

  var template = window.templates['public/templates/autocomplete']
      ,createMovieOtherParams = $("#createMovieForm").find("#createMovieOtherParams")
      ,createMovieModal = $("#createMovieModal")
      ,movieSummaryBlock = createMovieModal.find("#movieSummaryBlock");

  $('#movieName').typeahead({
    minLength: 3,
    remote: {
      url : '/movie/getmovies?q=%QUERY'
    },
    template: template,
    engine: Handlebars
  });

  $('#movieName').on("typeahead:selected",function(evt,data){

      // set overflow back to scroll for modal body
      //selectize.options = {};
      $("#createMovieFormBtn").removeClass("disabled");
      $("#createMovieModal #createMovieFormBtn").removeAttr("disabled");
      flag = false;
      selectize.clear();
      selectize.clearOptions();
      //createMovieModal.find(".modal-body").css({"overflow":"scroll","height":"400px"});
      createMovieModal.find(".modal-body").css("height","400px");
      createMovieModal.css("width","750px");
      createMovieOtherParams.removeClass("hide");
      movieSummaryBlock.removeClass("hide");
      // setting up variables to be send to backend
      $("#movieId").attr("value",data.movieId);
      $("#imageUrl").attr("value",data.imagePath);
      $("#yearOfRelease").attr("value",data.yearOfRelease);
      $.ajax({
        url: '/movie/getmoviedetails',
        data: {
          movieId: data.movieId
        },
        cache: true
      }).done(function(message){
          setMovieDetails(message,data.thumbUrl);
      });
  });

  $("#movieName").ajaxStart(function(){
    if(flag){
      $("#createMovieForm .loader").removeClass('hide');
    }
    flag = true;
  });
  $("#movieName").ajaxStop(function(){
    $("#createMovieForm .loader").addClass('hide');
  });
}

function setMovieDetails(message,image){

  var movieSummaryBlock = $("#movieSummaryBlock");
  movieSummaryBlock.find("#useSummaryChk").parent().removeClass("hide").addClass("show");
  movieSummaryBlock.find("#mdbImage").attr("src",image);
  $("#genres").attr("value",message.genres);
  if(typeof message !== 'undefined'){
    for(var i=0; i<message.keywords.length; i++){
      // initialize select box with new tags suggestions
      selectize.options[message.keywords[i]] = {text:message.keywords[i],value:message.keywords[i]};
      //selectize.addOption(message.keywords[i],message.keywords[i]);
    }
    movieSummaryBlock.find("#mdbTitle").html($("#movieName").value);
    movieSummaryBlock.find("#mdbSummary").html(message.overview);
    //$("#createMovieModal").find
  }
}

//create movie

function createMovie(){

    $("#createMovieModal #createMovieFormBtn").addClass("disabled");
    $("#createMovieModal #createMovieFormBtn").attr("disabled","disabled");
    var createMovieIn = $("#createMovieForm").find("#movieName");
    if(createMovieIn.val().trim() == ""){
      showToast("Please enter a movie name","error")
    }
    else {
      var selectedTags = $("#select-tags").prop("options");
      var tagsArray = [];
      for(var i=0; i<selectedTags.length; i++){
        tagsArray.push(selectedTags[i].value);
      }
      $("#associatedTags").val(tagsArray.join(","));
      var urlParams = $("#createMovieForm").serialize();
      $.ajax({
        url: '/movie/create',
        data: urlParams
      }).done(function(message){
          console.log(message);
          addMovieTemplate(getMovieData(message.movieId));
          $("#createMovieModal").modal('hide');
          showToast(message.msg,"success");
          resetMovieModal();
      });
    }
}

function resetMovieModal(){

  var createMovieOtherParams = $("#createMovieForm").find("#createMovieOtherParams")
      ,createMovieModal = $("#createMovieModal")
      ,movieSummaryBlock = createMovieModal.find("#movieSummaryBlock");

  createMovieModal.find(".modal-body").css({"overflow":"visible","height":"100px"});
  createMovieModal.css("width","400px");
  createMovieOtherParams.addClass("hide");
  movieSummaryBlock.addClass("hide");
  createMovieModal.find("#wantToWatchRadio").prop("checked",false);
  createMovieModal.find("#watchedRadio").prop("checked",false);
  createMovieModal.find("#userDefinedSummary").val("");
  createMovieModal.find("#useSummaryChk").prop("checked",false);
  createMovieModal.find("#mdbSummary").html("");
  createMovieModal.find("#mdbImage").attr("src","");

}

// add it to stream using template
// do nothing if movieTemplate is not available

function addMovieTemplate(movieData){

  if($("#movieTemplate").length > 0){
    var template = window.templates['public/templates/createmovie']
        ,result = template(movieData);
    $("#movieStream").prepend(result);
  }
}

// return current movies data if it's movie stream page
function getMovieData(movieId){
  var imageBaseUrl = 'http://d3gtl9l2a4fn1j.cloudfront.net/t/p/'
      ,normalSize = 'w185';

  var data = {
    name: $("#movieName").val(),
    movieId: movieId+'',
    coverPhoto: imageBaseUrl + normalSize + $("#imageUrl").val(),
    yearOfRelease: $("#yearOfRelease").val(),
    tagsLength: $("#select-tags").prop("options").length,
    userDefinedSummary: $("#userDefinedSummary").val(),
    creatorName: $("#userName").val(),
    creationDate: new Date().toDateString()
  };
  return data;
}

//handler for adding movies to favorite
$("#movieStream,.movie-profile-toolbar").on("click",".favorite",function(){
  var favorited = $(this).attr("data-favorited");
  if(favorited === "n"){
    $(this).attr("data-favorited","y");
    favoriteUnfavoriteMovie("favorite",$(this).attr("data-movieid"),$(this));
  }
  else if(favorited === "y"){
    $(this).attr("data-favorited","n")
    favoriteUnfavoriteMovie("unfavorite",$(this).attr("data-movieid"),$(this));
  }
  $(this).toggleClass("favorited");
});

// event handler for want to watch and watched buttons
$(".movie-item").on("click",".movie-status-toolbar button",function(){
  var me = $(this);
  $.ajax({
    url:'/list/addtosyslist',
    data: {
      sysListType: me.data("syslist"),
      movieId: me.data("movieid")
    }
  }).done(function(result){
      showToast(result.status);
  });
});

function showToast(msg,type){
  toastr.options = {
    "debug": false,
    "positionClass": "toast-top-full-width",
    "onclick": null,
    "fadeIn": 300,
    "fadeOut": 1000,
    "timeOut": 2000,
    "extendedTimeOut": 1000
  };
  if(type && type != ""){
    toastr[type](msg);
  }
  else{
    toastr["info"](msg); 
  }
}

function favoriteUnfavoriteMovie(action,movieId,element){
    var url = (action === "favorite") ? "/movie/favorite" : "/movie/unfavorite";
    var favoriteEl = element.children("span");
    if(favoriteEl.length > 0 && favoriteEl.html()){
      switch(action){
        case "favorite":
          favoriteEl.html(parseInt(favoriteEl.html().trim()) + 1);
          break;
        case "unfavorite":
          favoriteEl.html(parseInt(favoriteEl.html().trim()) - 1);
          break;
      }
    }
    $.ajax({
      url : url,
      data: {movieId: movieId}
    }).done(function(message){
      console.log("favorited")
    });
  };

  //handler for adding movies to list
$("#movieStream,.movie-profile-toolbar").on("click",".wishlist",function(){
  var $wishlistModal = $("#addToWishListModal")
    , movieId = $(this).data("movieid")
    , $userWishlists = $wishlistModal.find("#userWishlists");

  $wishlistModal.find("#userWishListBlock").addClass("hide");
  $wishlistModal.find("#wishListLoader").removeClass("hide");
  $wishlistModal.find("#newWishListName").attr('data-movieid',movieId);
  $.ajax({
    url : '/list/getwishlists',
    data: {movieId: movieId}
  }).done(function(list){
    $userWishlists.children().remove();
    if(list.length >0){
      var elem
      ,inpt
      ,lbl;
      for(var i=0; i<list.length; i++){
        elem = $("<label class='checkbox inline'></label>");
        if(list[i].containsMovie == "y"){
          inpt = $("<input type='checkbox' checked/>").attr({
            'data-listid' : list[i].listId,
            'data-movieid': movieId
          });
        }
        else {
          inpt = $("<input type='checkbox'/>").attr({
            'data-listid' : list[i].listId,
            'data-movieid': movieId
          });
        }
        lbl = list[i].name;
        elem.append(lbl);
        elem.append(inpt);
        $userWishlists.append(elem);
        $wishlistModal.find("#wishListLoader").addClass("hide");
        $wishlistModal.find("#userWishListBlock").removeClass("hide");
      }
    }
    else{
      $wishlistModal.find("#wishListLoader").addClass("hide");
      $wishlistModal.find("#userWishListBlock").removeClass("hide");
      $userWishlists.html("No list found");
    }
  });
  $wishlistModal.modal("show");
});

/*################ JS for profile page ##############*/

$(".follow-unfollow").hover(
  function(){
    if($(this).attr("following") === "y"){
      $(this).removeClass("btn-info");
      $(this).addClass("btn-danger");
      $(this).html("Unfollow");
    }
  },
  function(){
    if($(this).attr("following") === "y"){
      $(this).removeClass("btn-danger");
      $(this).addClass("btn-info");
      $(this).html("Following");
    }
  }
);

$(".follow-unfollow").click(
  function(){
    var userId = $(this).attr("userId");
    // unfollow
    if($(this).attr("following") === "y"){
      $(this).attr("following","n");
      $(this).removeClass("btn-danger");
      $(this).addClass("btn-secondary");
      $(this).html("Follow");
      followUnFollowUser('unfollow',userId);
    }
    // follow
    else if($(this).attr("following") === "n"){
      $(this).attr("following","y");
      $(this).removeClass("btn-secondary");
      $(this).addClass("btn-info");
      $(this).html("Following");
      followUnFollowUser('follow',userId);
    }
  }
);

$("#userWishlists").on("change", "input[type=checkbox]", function(){
  var url = $(this).prop('checked') ? "/list/addmovie" : "/list/removemovie";
  $.ajax({
    url : url,
    data: {movieId: $(this).data('movieid'), listId: $(this).data('listid')}
  }).done(function(message){
    console.log(message);
  });
})

$("#comments").submit(function(evt){
  evt.preventDefault();
  $commentsTextArea = $("#comments textarea");
  if($commentsTextArea.val().trim() == ""){
    showToast("Please enter a comment", "error")
  }
  else {
    postComment();
  }
})

function postComment(){

  $commentsTextArea = $("#comments textarea");
  $("#commentsLoader").removeClass("hide");
  $.post('/movie/addcomment',$("#comments").serialize()).done(function(result){
    console.log(result.status);
    if(result.status == "success"){
      $("#commentsLoader").addClass("hide");
      var template = window.templates['public/templates/comment']
      , movieData = {
        commentorId: $("#userId").val(),
        commentorName : $("#userName").val(),
        comment: $commentsTextArea.val()
      }
      , result = template(movieData);
      $commentsTextArea.val("");
      $("#movieComments #noCommentsMessage").remove();
      $("#movieComments").prepend(result);
    }
  });
}

function createWishlist(){

  var elem = $("#addToWishListModal").find("#newWishListName");
  var movieId = elem.data('movieid');
  var name = elem.attr('value');
  if(name.trim() == ""){
    showToast("Please enter a list name","error");
  }
  else{
    $.ajax({
    url : '/list/createwishlistaddmovie',
    data: {name: name, movieId: movieId}
  }).done(function(message){
    elem.attr("value","");
    $("#addToWishListModal").modal("hide");
    showToast("Added Movie","success");
  });
  }
}

function followUnFollowUser(action,userId){
  var url = (action === "follow") ? "/user/followuser" : "/user/unfollowuser";
  $.ajax({
    url : url,
    data: {followUserId: userId}
  }).done(function(message){
    console.log(message);
  });
}

function uploadProfilePic(){
  $('#profilePicUploadForm').submit();
}


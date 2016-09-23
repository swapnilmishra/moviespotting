this["templates"] = this["templates"] || {};

this["templates"]["public/templates/createmovie"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<li class=\"span3\">\n      <div class=\"movie-item-inner-container shadow\">\n\n        <div class=\"movie-item\">\n          <a href=\"/movie/showmovie/";
  if (stack1 = helpers.movieId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.movieId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n            <img src=\"";
  if (stack1 = helpers.coverPhoto) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.coverPhoto; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\" class=\"movie-image-thumb\">\n          </a>\n          <ul class=\"inline movie-status-toolbar\">\n            <li><button class=\"btn btn-small btn-info\" data-syslist=\"wanttowatch\" data-movieid=\"";
  if (stack1 = helpers.movieId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.movieId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">Want to watch</button></li>\n            <li><button class=\"btn btn-small\" data-syslist=\"watched\" data-movieid=\"";
  if (stack1 = helpers.movieId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.movieId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">Watched</i></button></li>\n          </ul>\n        </div>\n\n        <div class=\"movie-title\">\n          <span class=\"ellipsis\">";
  if (stack1 = helpers.name) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.name; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</span>\n        </div>\n\n        <ul class=\"inline toolbar\">  \n          <li class=\"right favorite\" data-favorited=\"n\" data-movieid=\"";
  if (stack1 = helpers.movieId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.movieId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n            <i class=\"icon-heart icon-large\" data-toggle='tooltip' title='Add to favorite' data-placement='top'></i>&nbsp;0\n          </li>\n          <li>\n            <i class=\"default-grey-link icon-bookmark icon-large wishlist\" data-toggle='tooltip' title='Add to wishlist' data-placement='top' data-movieid=\"";
  if (stack1 = helpers.movieId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.movieId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\"></i>\n          </li>\n          <li>\n            <a href=\"/movie/showmovie/3#disqus_thread\" class=\"default-grey-link\">\n              <i class=\"icon-comments icon-large\" data-toggle=\"tooltip\" title=\"\" data-placement=\"top\" data-original-title=\"Comments\">&nbsp;</i>\n            </a>\n          </li>\n        </ul>\n\n        <div class=\"movie-item-footer\">\n          <span class=\"default-grey-color\"> by </span>\n          <a href=\"/user/showuserprofile\">";
  if (stack1 = helpers.creatorName) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.creatorName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</a>\n        </div>\n      </div>\n    </li>\n";
  return buffer;
  });
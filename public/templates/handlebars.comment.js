this["templates"] = this["templates"] || {};

this["templates"]["public/templates/comment"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, functionType="function", escapeExpression=this.escapeExpression;


  buffer += "<hr>\n<div>\n    <a href=\"/user/showuserprofile/";
  if (stack1 = helpers.commentorId) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.commentorId; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "\">\n        <strong>";
  if (stack1 = helpers.commentorName) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.commentorName; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + "</strong>\n    </a>\n    <span class=\"muted\"> said </span>\n\n</div>\n<div style=\"margin-top:10px;\">\n    <span> ";
  if (stack1 = helpers.comment) { stack1 = stack1.call(depth0, {hash:{},data:data}); }
  else { stack1 = depth0.comment; stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1; }
  buffer += escapeExpression(stack1)
    + " </span>\n</div>";
  return buffer;
  });
(this.webpackJsonpGrading4Canvas=this.webpackJsonpGrading4Canvas||[]).push([[0],{120:function(e,t,a){"use strict";a.r(t);var n=a(0),r=a.n(n),c=(a(55),a(21)),i=a(14),s=a(67),o=a(10),l=a(78),u=a(12),d=a(7),m=a.n(d),f=a(15),g=a(30),v=a(8),p=a(72),E=a(73),h=a(81),b=a(80),O=a(34),j=function(e){Object(h.a)(a,e);var t=Object(b.a)(a);function a(){return Object(p.a)(this,a),t.apply(this,arguments)}return Object(E.a)(a,[{key:"render",value:function(){return r.a.createElement("div",{id:"overlay"}," ",r.a.createElement("div",{id:"spinner_icon"}," ",r.a.createElement(O.a,{animation:"border",size:"lg"})," ")," ")}}]),a}(n.Component),w=a(11),_=a(29),y=a(17);function C(e){var t,a=Object(n.useState)(!1),c=Object(o.a)(a,2),i=c[0],s=c[1],l=function(){return s(!1)};return r.a.createElement(r.a.Fragment,null,r.a.createElement("a",{onClick:function(){return s(!0)},href:"#"},"Past comments"),r.a.createElement(y.a,{centered:!0,show:i,animation:!1,onHide:l},r.a.createElement(y.a.Header,{closeButton:!0}),r.a.createElement(y.a.Body,null,null===(t=e.comments)||void 0===t?void 0:t.map((function(e){return r.a.createElement("div",{className:"comment"},r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-2"},r.a.createElement("img",{src:null===e||void 0===e?void 0:e.author.avatar_image_url,alt:""})),r.a.createElement("div",{className:"col-sm-10"},r.a.createElement("p",null,e.comment))))}))),r.a.createElement(y.a.Footer,null,r.a.createElement(w.a,{variant:"secondary",onClick:l},"Close"))))}function S(e){var t,a=Object(n.useState)(!1),c=Object(o.a)(a,2),i=c[0],s=c[1],l=function(){return s(!1)};return r.a.createElement(r.a.Fragment,null,r.a.createElement("a",{onClick:function(){return s(!0)},href:"#"},"Attachments"),r.a.createElement(y.a,{centered:!0,show:i,animation:!1,onHide:l},r.a.createElement(y.a.Header,{closeButton:!0}),r.a.createElement(y.a.Body,null,null===(t=e.attachments)||void 0===t?void 0:t.map((function(e){return r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-2"},r.a.createElement("a",{href:e.url},r.a.createElement("img",{src:"https://img.icons8.com/ios/50/000000/download.png",alt:""}))),r.a.createElement("div",{className:"col-sm-10"},r.a.createElement("p",{className:"vir-center-download-img"},r.a.createElement("a",{href:e.url},e.filename))))}))),r.a.createElement(y.a.Footer,null,r.a.createElement(w.a,{variant:"secondary",onClick:l},"Close"))))}function N(e){var t,a,n,c,i,s,o,l;return r.a.createElement("div",{className:"quick-edit-submission"},r.a.createElement("div",{id:"name-grade-container"},r.a.createElement("div",{id:"student_name"},null===(t=e.data)||void 0===t||null===(a=t.user)||void 0===a?void 0:a.login_id),r.a.createElement("div",{id:"grade_input"},r.a.createElement("span",{className:"out-of-text"},"Grade out of 100"),console.log(e.data),r.a.createElement("input",(i={type:"text","data-grade":null===(n=e.data)||void 0===n?void 0:n.user_id,ref:function(t){return e.gradeInput.current=t},name:"assigned_grade",defaultValue:null===(c=e.data)||void 0===c?void 0:c.score,onChange:function(t){var a;return e.handleCommentGrade(null===(a=e.data)||void 0===a?void 0:a.user_id,t,"grade")}},Object(_.a)(i,"type","number"),Object(_.a)(i,"min",0),Object(_.a)(i,"max",100),i)))),r.a.createElement("textarea",{name:"comment","data-comment":null===(s=e.data)||void 0===s?void 0:s.user_id,type:"text",placeholder:"Enter feedback here",className:"feedback-form",onChange:function(t){var a;return e.handleCommentGrade(null===(a=e.data)||void 0===a?void 0:a.user_id,t,"comment")}}),r.a.createElement("div",{className:"submission_actions"},r.a.createElement("ul",null,r.a.createElement("li",null,r.a.createElement(C,{comments:null===(o=e.data)||void 0===o?void 0:o.submission_comments})),r.a.createElement("li",null,r.a.createElement(S,{attachments:null===(l=e.data)||void 0===l?void 0:l.attachments})))))}function k(e){var t=e.displayName,a=e.user_id,n=e.is_graded,c=e.loading,i=e.assignment_id;return r.a.createElement("div",{className:"assignment"},r.a.createElement("div",{className:"student-name"},c?r.a.createElement(O.a,{animation:"grow"}):r.a.createElement(r.a.Fragment,null),i?r.a.createElement("a",{href:"/assignments/"+i+"/"+a},t):r.a.createElement(r.a.Fragment,null,a)),null===n|void 0===n|0==n?r.a.createElement("div",{className:"grade-status"},r.a.createElement("div",{className:"grade-icon-red"})):r.a.createElement("div",{className:"grade-status"},r.a.createElement("div",{className:"grade-icon"})))}var x=a(28),R=a.n(x),A=Object(n.createContext)(null),D=a(6),I=a.n(D);function T(e){var t=Object(n.useContext)(A),a=Object(i.d)(),c=Object(n.useRef)([]),s=Object(n.useRef)(),o=Object(v.a)((function(){return I()("/api/get-assigned-submissions-for-assigment?user_id=".concat(null===t||void 0===t?void 0:t.id,"&assigment_id=").concat(e.assignment_id))}),{manual:!0,onSuccess:function(){var n=Object(f.a)(m.a.mark((function n(r,c){var i,s;return m.a.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:0==r.length?(a.show("You have no assigned submissions for this assignment yet"),e.showControls(!1)):(a.removeAll(),i=[],r.map((function(e){i.push([e.user_id,e.name]),l.run(e.user_id,e.name)})),s={assignment_id:e.assignment_id,user_ids:i,grader_id:null===t||void 0===t?void 0:t.id},e.setDownloadGraderIds(s),e.showControls(!0));case 1:case"end":return n.stop()}}),n)})));return function(e,t){return n.apply(this,arguments)}}(),onError:function(e,t){a.error("Something went wrong when pulling your submissions, please try refreshing the page.")},formatResult:function(e){return Object(g.a)(e.data)},initialData:[]}),l=Object(v.a)(function(){var t=Object(f.a)(m.a.mark((function t(a,n){return m.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",I()({url:"/api/canvas-api",method:"POST",data:{endpoint:"assignments/".concat(e.assignment_id,"/submissions/").concat(a,"?include[]=user&include[]=submission_comments")}}));case 1:case"end":return t.stop()}}),t)})));return function(e,a){return t.apply(this,arguments)}}(),Object(_.a)({manual:!0,initialData:[],fetchKey:function(e){return e},formatResult:[],onError:function(e,t){a.error("".concat(e.response.data))}},"formatResult",(function(e){return e.data}))),u=Object(v.a)(function(){var t=Object(f.a)(m.a.mark((function t(a,n){return m.a.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.abrupt("return",fetch("/api/upload-submission-grades/assignments/".concat(e.assignment_id,"/submissions/batch-update-grades"),{method:"POST",credentials:"include",headers:{"Content-Type":"application/json",Accept:"application/json","Access-Control-Allow-Credentials":!0},body:JSON.stringify(c.current)}));case 1:case"end":return t.stop()}}),t)})));return function(e,a){return t.apply(this,arguments)}}(),{manual:!0,onSuccess:function(){var e=Object(f.a)(m.a.mark((function e(t,n){return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:200==t.status?(c.current=[],a.success("Your feedback has been submitted successfully")):a.error("Grades were not saved. Please try again or update your Canvas token");case 1:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),onError:function(e,t){a.error("Something went wrong, while processing your request. Please try again in a few minutes")}});Object(n.useEffect)((function(){o.run("/api/get-assigned-submissions-for-assigment?user_id=1&assigment_id="+e.assignment_id)}),[e.assignment_id]);var d=function(e,t,a){if(c.current.some((function(t){return t.id==e}))){var n=c.current.findIndex((function(t){return t.id==e}));c.current[n]["grade"==a?"assigned_grade":"comment"]=t.target.value}else c.current.push({id:e,assigned_grade:document.querySelector("[data-grade='".concat(e,"']")).value,comment:document.querySelector("[data-comment='".concat(e,"']")).value,is_group_comment:!1})};return r.a.createElement("div",null,(null===u||void 0===u?void 0:u.loading)|(null===o||void 0===o?void 0:o.loading)?r.a.createElement(j,null):null,Object.values(null===l||void 0===l?void 0:l.fetches).map((function(t){var a,n,c,i,o,l,u;return r.a.createElement("div",{key:null===(a=t.data)||void 0===a?void 0:a.id},e.bulk_edit?r.a.createElement(N,{data:t.data,gradeInput:s,handleCommentGrade:d}):r.a.createElement(k,{user_id:null===t||void 0===t||null===(n=t.data)||void 0===n||null===(c=n.user)||void 0===c?void 0:c.id,displayName:null===t||void 0===t||null===(i=t.data)||void 0===i||null===(o=i.user)||void 0===o?void 0:o.login_id,assignment_id:null===t||void 0===t||null===(l=t.data)||void 0===l?void 0:l.assignment_id,is_graded:null===t||void 0===t||null===(u=t.data)||void 0===u?void 0:u.graded_at,loading:t.loading}))})),r.a.createElement(w.a,{onClick:function(){Object.keys(c)&&u.run()},className:"float-right ".concat(e.bulk_edit?"visible":"invisible")},"Submit feedback"),r.a.createElement("div",{className:"clear-fix"}))}var P=a(113);function F(){var e=Object(n.useState)([]),t=Object(o.a)(e,2),a=t[0],c=t[1],s=Object(n.useState)(!1),l=Object(o.a)(s,2),u=l[0],d=l[1],p=Object(n.useState)(0),E=Object(o.a)(p,2),h=E[0],b=E[1],_=Object(n.useState)(!1),y=Object(o.a)(_,2),C=y[0],S=y[1],N=Object(n.useState)({}),k=Object(o.a)(N,2),x=k[0],R=k[1],A=Object(i.d)(),D=Object(v.a)((function(){return I()("/api/get-all-assignments")}),{manual:!0,onSuccess:function(e){c(e),0!=e.length&&b(e[0].assignment_id)},formatResult:function(e){return Object(g.a)(e.data)},initialData:[]}),F=Object(v.a)((function(){return I()({url:"/api/download-submission",method:"POST",responseType:"arraybuffer",data:x})}),{manual:!0,onSuccess:function(){var e=Object(f.a)(m.a.mark((function e(t){var a;return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:a=new Blob([t.data]),P.saveAs(a,"Submissions.zip");case 2:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),onError:function(){var e=Object(f.a)(m.a.mark((function e(t){return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:A.error("Something went wrong, please try again later");case 1:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}()});return Object(n.useEffect)((function(){D.run()}),[]),D.loading?r.a.createElement(j,null):r.a.createElement("div",{className:"container"},r.a.createElement("div",null,C?r.a.createElement(r.a.Fragment,null,r.a.createElement(w.a,{variant:"secondary",disabled:D.loading,className:"float-right",size:"lg",onClick:function(){return d(!u)}},u?"Back":"Bulk edit"),r.a.createElement(w.a,{id:"download-buttn",disabled:!!F.loading,variant:"outline-secondary",className:"float-right",size:"lg",onClick:function(){F.run()}},"Download",F.loading?r.a.createElement(O.a,{id:"downloadBtnSpinner",as:"span",animation:"border",size:"sm",role:"status","aria-hidden":"true"}):r.a.createElement(r.a.Fragment,null))):r.a.createElement(r.a.Fragment,null),r.a.createElement("div",{className:"clear-fix"}),r.a.createElement("div",{id:"select-assignment"},r.a.createElement("select",{id:"dropdown-assignment-selector",onChange:function(e){return b(e.target.value)}},a.map((function(e){return r.a.createElement("option",{key:e.assignment_id,value:e.assignment_id},e.assignment_name)})))),r.a.createElement("div",{className:"assignments-container"},r.a.createElement(T,{setDownloadGraderIds:R,key:h,assignment_id:h,bulk_edit:u,showControls:S}))))}function B(e){var t,a=Object(i.d)(),c=Object(n.useRef)([]),s=Object(n.useRef)(),o=Object(v.a)((function(){return I()({url:"/api/canvas-api",method:"post",data:{endpoint:"/api/assignments/".concat(e.match.params.assignment_id,"/submissions/").concat(e.match.params.student_id,"?include[]=user&include[]=submission_comments")}})}),{manual:!0,initialData:[],fetchKey:function(e){return e},formatResult:[],onError:function(e,t){a.error(e.response.data)}}),l=Object(v.a)((function(){return I()("/api/upload-submission-grades/assignments/".concat(e.match.params.assignment_id,"/submissions/batch-update-grades"),{method:"post",data:c.current})}),{manual:!0,onSuccess:function(){var e=Object(f.a)(m.a.mark((function e(t,n){return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:c.current=[],a.success(t.data);case 2:case"end":return e.stop()}}),e)})));return function(t,a){return e.apply(this,arguments)}}(),onError:function(e,t){a.error(e.response.data)}});Object(n.useEffect)((function(){console.log(e),o.run()}),[]);return r.a.createElement("div",{class:"container"},r.a.createElement(N,{data:null===(t=o.data)||void 0===t?void 0:t.data,gradeInput:s,handleCommentGrade:function(e,t,a){if(c.current.some((function(t){return t.id==e}))){var n=c.current.findIndex((function(t){return t.id==e}));c.current[n]["grade"==a?"assigned_grade":"comment"]=t.target.value}else c.current.push({id:e,assigned_grade:document.querySelector("[data-grade='".concat(e,"']")).value,comment:document.querySelector("[data-comment='".concat(e,"']")).value,is_group_comment:!1})}}),r.a.createElement(w.a,{onClick:function(){Object.keys(c)&&l.run()},className:"float-right"},"Submit feedback"),r.a.createElement("div",{className:"clear-fix"}))}var G=a(16);function L(e){var t=Object(n.useContext)(A);return r.a.createElement("div",null,r.a.createElement("header",{id:"navigation-container"},r.a.createElement("div",{className:"container"},r.a.createElement("div",{id:"navigation-content"},r.a.createElement("a",{href:"/assignments"},r.a.createElement("div",{id:"logo"},r.a.createElement("h1",null,"Canvas grading extension"))),r.a.createElement("div",{id:"user-profile-icon",className:void 0==(null===t||void 0===t?void 0:t.name)?"hide":""},r.a.createElement(G.a,null,r.a.createElement(G.a.Toggle,{variant:"link",id:"dropdown-basic"},"Hello, ".concat(null===t||void 0===t?void 0:t.name)),r.a.createElement(G.a.Menu,null,r.a.createElement(G.a.Item,{href:"/assignments"},"My workload"),r.a.createElement(G.a.Item,{href:"/dashboard"},"Dashboard"),r.a.createElement(G.a.Item,{href:"/settings"},"Setting"),r.a.createElement(G.a.Item,{href:"/auth/logout"},"Logout"))))))))}var q=a(75),H=a(77),V=a(82),U=a(31);function z(e){var t=e.user_id,a=e.assignment_id,c=Object(n.useState)(!1),s=Object(o.a)(c,2),l=s[0],u=s[1],d=function(){return u(!1)},g=Object(i.d)(),p=Object(n.useState)([]),E=Object(o.a)(p,2),h=E[0],b=E[1],O=Object(v.a)(Object(f.a)(m.a.mark((function e(){return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",fetch("/api/get-assigned-submissions-for-assigment?user_id=".concat(t,"&assigment_id=")+a,R.a.header));case 1:case"end":return e.stop()}}),e)}))),{manual:!0,initialData:[],onSuccess:function(){var e=Object(f.a)(m.a.mark((function e(t){var a;return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.json();case 2:a=e.sent,b(a);case 4:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),onError:function(){g.error("Something went wrong when pulling your submissions, please try refreshing the page.")}});return O.loading?r.a.createElement(j,null):r.a.createElement(r.a.Fragment,null,r.a.createElement("a",{onClick:function(){u(!0),O.run()},href:"#"},"View"),r.a.createElement(y.a,{centered:!0,show:l,animation:!1,onHide:d},r.a.createElement(y.a.Header,{closeButton:!0}),r.a.createElement(y.a.Body,null,0==h.length?"This grader has no submissions assigned yet":"",h.map((function(e){return r.a.createElement(k,{user_id:e.name,is_graded:e.is_graded})}))),r.a.createElement(y.a.Footer,null,r.a.createElement(w.a,{variant:"secondary",onClick:d},"Close"))))}var K=a(76);function Y(){var e,t=Object(n.useContext)(A),a=Object(i.d)(),c=Object(n.useState)([]),s=Object(o.a)(c,2),l=s[0],u=s[1],d=Object(n.useState)(null),p=Object(o.a)(d,2),E=p[0],h=p[1],b=Object(n.useState)([]),O=Object(o.a)(b,2),_=O[0],y=O[1],C=Object(v.a)((function(){return I()({url:"/api/unassigned-submissions/".concat(E)})}),{onSuccess:function(e){console.log(e)},onError:function(e,t){a.error("Something happened when fetching the number of ungraded submissions")},formatResult:function(e){return Object(q.a)({},e.data)},manual:!0,initialData:{}}),S=Object(v.a)((function(){return I()("/api/get-all-assignments")}),{onSuccess:function(e,t){var a;void 0!=(null===(a=e[0])||void 0===a?void 0:a.assignment_id)&&(k.run(e[0].assignment_id),h(e[0].assignment_id),y(e))},onError:function(e,t){a.error("Something went wrong while fetching assignments, please try refreshing the page")},formatResult:function(e){return Object(g.a)(e.data)},initialData:[]}),N=Object(v.a)(function(){var e=Object(f.a)(m.a.mark((function e(t){return m.a.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.abrupt("return",I()("/api/sync-with-canvas/".concat(t)));case 1:case"end":return e.stop()}}),e)})));return function(t){return e.apply(this,arguments)}}(),{manual:!0,onSuccess:function(e,t){a.success("Synced with canvas complete"),S.run(),k.run(E)},onError:function(e,t){a.error(e.response.data)},formatResult:function(e){return e.data}}),k=Object(v.a)((function(e){return I()("/api/get-grader-info?assignment_id=".concat(e))}),{manual:!0,onError:function(e,t){a.error("Something went wrong while fetching graders, please try refreshing the page.")},onSuccess:function(e){C.run()},formatResult:function(e){return Object(g.a)(e.data)},initialData:[]});function x(e,t,a){var n=l;if(n.some((function(e){return e.id==a}))){var r=n.findIndex((function(e){return e.id==a}));n[r][t]=parseInt(e.target.value)}else{var c={id:a};c[t]=parseInt(e.target.value),c.assignment_id=E,n.push(c)}u(Object(g.a)(n))}var R=Object(v.a)((function(){return I()({url:"/api/distribute",method:"POST",data:{assignment_id:E}})}),{manual:!0,onSuccess:function(e,t){k.run(E),a.success("Assignment distributed")},onError:function(e,t){k.run(E),a.error(e.response.data)},initialData:[]}),D=Object(v.a)((function(){return I()({url:"/api/update-grader-info",method:"post",data:l})}),{manual:!0,onSuccess:function(e){k.run(E),u([]),a.success("Updated changes")},onError:function(e,t){a.error("Something happened when saving chages, please try again")}});return k.loading|D.loading|S.loading|N.loading|R.loading?r.a.createElement(j,null):r.a.createElement("div",{className:"container"},r.a.createElement(K.a,{id:"dropdown-basic-button",variant:"secondary",className:"float-left",title:"Sync with Canvas",onSelect:function(e){N.run(e)}},r.a.createElement(G.a.Item,{eventKey:"submissions and assignments"},"Sync assignments and submissions"),r.a.createElement(G.a.Item,{eventKey:"graders"},"Sync Graders")),r.a.createElement("select",{className:"float-right",id:"selectAssignmentDropdown",value:E,onChange:function(e){return function(e){null!=e.target.value&&(k.run(e.target.value),h(e.target.value))}(e)}},r.a.createElement("option",null,"Select assignment"),_.map((function(e){return r.a.createElement("option",{value:e.assignment_id,key:e.assignment_id},"Progress for ",e.assignment_name)}))),r.a.createElement("div",{className:"clearfix"}),r.a.createElement(H.a,{bordered:!0,hover:!0,id:"dashboardTable"},r.a.createElement("thead",null,r.a.createElement("tr",null,r.a.createElement("th",null,"NetId"),r.a.createElement("th",null,"Weights"),r.a.createElement("th",null,"Offsets"),r.a.createElement("th",null,"Cap"),r.a.createElement("th",null,"Assigned"),"PROFESSOR"==(null===t||void 0===t?void 0:t.role)?r.a.createElement("th",null,"Workload"):"",r.a.createElement("th",null,"Progress"))),r.a.createElement("tbody",null,k.data.map((function(e){return r.a.createElement("tr",{key:e.id},r.a.createElement("td",{className:"width-1"},null===e||void 0===e?void 0:e.name),r.a.createElement("td",{className:"width-10"},r.a.createElement(U.a,{defaultValue:e.weight,onChange:function(t){return x(t,"weight",e.id)},placeholder:"Enter",type:"number",min:"0",pattern:"[0-9]*"})),r.a.createElement("td",{className:"width-10"},r.a.createElement(U.a,{defaultValue:e.offset,onChange:function(t){return x(t,"offset",e.id)},placeholder:"Enter",type:"number"})),r.a.createElement("td",{className:"width-10"},r.a.createElement(U.a,{defaultValue:e.cap,onChange:function(t){return x(t,"cap",e.id)},placeholder:"None",type:"number",min:"0",pattern:"[0-9]*"})),r.a.createElement("td",{className:"width-1"},e.total_assigned_for_assignment),"PROFESSOR"==(null===t||void 0===t?void 0:t.role)?r.a.createElement("td",{className:"width-1"},r.a.createElement(z,{user_id:e.id,assignment_id:e.assignment_id})):"",r.a.createElement("td",{className:"width-30"},r.a.createElement(V.a,{animated:!0,now:e.progress,label:e.num_graded})))})))),r.a.createElement(w.a,{className:"float-right",disabled:0!=l.length,id:"distribute-btn",onClick:R.run},"Distribute ",r.a.createElement("span",{class:"badge badge-pill badge-light"},null===(e=C.data)||void 0===e?void 0:e.num_unassigned)),r.a.createElement(w.a,{className:"float-right",disabled:0==l.length,onClick:D.run},"Update"))}function J(e){var t=Object(i.d)();return Object(n.useEffect)((function(){var a=function(t){var a=null,n=[];return e.location.search.substr(1).split("&").forEach((function(e){(n=e.split("="))[0]===t&&(a=decodeURIComponent(n[1]))})),a}("message");console.log(a),null!=a&&t.info(a)}),[]),r.a.createElement("div",null,r.a.createElement("div",{className:"container"},r.a.createElement("div",{id:"welcome_text_conatiner"},r.a.createElement("div",{id:"textboxcenter"},r.a.createElement("p",null," Welcome to Canvas Grading Extension"),r.a.createElement("p",null,"Please login using your Cornell email account"),r.a.createElement("a",{href:"/auth/google",id:"login-link"},"Login")))))}function M(e){var t,a=Object(n.useState)(null),c=Object(o.a)(a,2),s=c[0],l=c[1],u=Object(n.useState)(),d=Object(o.a)(u,2),m=d[0],f=d[1],g=Object(n.useState)(null),p=Object(o.a)(g,2),E=p[0],h=p[1],b=Object(i.d)(),O=Object(n.useContext)(A),_=Object(v.a)((function(){return I()({url:"/api/update-canvas-token",method:"post",data:{token:s}})}),{manual:!0,onSuccess:function(e,t){b.success(e.data)},onError:function(e,t){b.error(e.response.data)}}),y=Object(v.a)((function(){return I()({url:"/api/delete-data-base"})}),{manual:!0,onSuccess:function(e,t){b.success(e.data)},onError:function(e,t){b.error("Something went wrong when deleting the course")}}),C=Object(v.a)((function(){return I()({url:"/api/update-course-id",method:"post",data:{course_id:E}})}),{manual:!0,onSuccess:function(e,t){b.success(e.data)},onError:function(e,t){b.error(e.response.data)}}),S=Object(v.a)((function(){return I()({url:"/api/get-course-id"})}),{formatResult:function(e){return e.data}});return _.loading?r.a.createElement(j,null):r.a.createElement("div",{className:"container"},r.a.createElement("section",{class:"setting"},r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-8"},r.a.createElement("h4",null,"Your canvas token"),r.a.createElement("p",null,"Vist Account in account in Canvas then go into settings to generate a token"))),r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-8"},r.a.createElement(U.a,{onChange:function(e){return l(e.target.value)},placeholder:"Paste Canvas token here"})),r.a.createElement("div",{className:"col-sm-4"},r.a.createElement(w.a,{variant:"primary",onClick:function(){null!=s?_.run():b.info("Please enter a token first")}},"Update")))),"PROFESSOR"==(null===O||void 0===O?void 0:O.role)&&r.a.createElement("section",{class:"setting"},r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-8"},r.a.createElement("h4",null,"Course ID"),r.a.createElement("p",null,"Link your course ID from Canvas"))),r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-8"},r.a.createElement(U.a,{defaultValue:null===S||void 0===S||null===(t=S.data)||void 0===t?void 0:t.course_id,onChange:function(e){return h(e.target.value)}})),r.a.createElement("div",{className:"col-sm-4"},r.a.createElement(w.a,{variant:"primary",onClick:C.run},"Link course")))),r.a.createElement("section",{class:"setting"},r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-8"},r.a.createElement("h4",null,"Reset course data"),r.a.createElement("p",null,"This will remove graders, submissions and assignments"))),r.a.createElement("div",{className:"row"},r.a.createElement("div",{className:"col-sm-8"},r.a.createElement(U.a,{onChange:function(e){return f(e.target.value)},placeholder:"This change cannot be undone. Confirm by DELETE ALL COURSE DATA to continue"})),r.a.createElement("div",{className:"col-sm-4"},r.a.createElement(w.a,{variant:"danger",onClick:function(){"DELETE ALL COURSE DATA"==m?y.run():b.info("Your confirm text is incorrect, course not deleted")}},"Reset course")))))}a(117);var W=function(){var e=Object(n.useState)(null),t=Object(o.a)(e,2),a=t[0],c=t[1];return Object(n.useEffect)((function(){I()({url:"auth/user"}).then((function(e){void 0!=e&&c(e.data.user)})).catch()}),[]),r.a.createElement("div",null,r.a.createElement(A.Provider,{value:a},r.a.createElement(l.a,null,r.a.createElement(L,null),r.a.createElement(u.c,null,r.a.createElement(u.a,{path:"/",component:J,exact:!0}),r.a.createElement(u.a,{exact:!0,path:"/assignments",component:F}),r.a.createElement(u.a,{path:"/assignments/:assignment_id/:student_id",exact:!0,component:B}),r.a.createElement(u.a,{path:"/dashboard",component:Y}),r.a.createElement(u.a,{path:"/settings",component:M})))))},Q={position:i.b.BOTTOM_CENTER,timeout:5e3,transition:i.c.FADE};I.a.interceptors.request.use((function(e){return e.withCredentials=!0,e.header={Accept:"application/json","Content-Type":"application/json","Access-Control-Allow-Credentials":!0},e}),(function(e){return Promise.reject(e)})),I.a.interceptors.response.use((function(e){return e}),(function(e){return console.log(e.response),void 0!=e.response&&401==e.response.status&&"/"!=window.location.pathname&&(window.location="/?message=Either your session has ended or you are not logged in"),Promise.reject(e)}));var X=function(){return r.a.createElement(i.a,Object.assign({template:s.a},Q),r.a.createElement(W,null))};Object(c.render)(r.a.createElement(X,null),document.getElementById("root"))},28:function(e,t){e.exports={header:{credentials:"include",headers:{Accept:"application/json","Content-Type":"application/json","Access-Control-Allow-Credentials":!0}},backend:{url:""}}},55:function(e,t,a){},83:function(e,t,a){e.exports=a(120)}},[[83,1,2]]]);
//# sourceMappingURL=main.267f6649.chunk.js.map
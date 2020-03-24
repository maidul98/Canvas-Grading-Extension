import React from "react";
import { Link} from "react-router-dom";
import withBreadcrumbs from "react-router-breadcrumbs-hoc";


const bread = ({ breadcrumbs }) => (
    <div className="breadcrumb"><div className = "container">
      {breadcrumbs.map(({ breadcrumb, match }, index) => {
        console.log(breadcrumb);
        if (breadcrumb.key != "/") {
        return (
           <ol className="bc" key={match.url}>
            <Link className='bc_a' to={match.url || ""}>{breadcrumb}</Link>
            {index < breadcrumbs.length - 1 && "/"}
          </ol>
        );}
      })}
    </div></div>
  );
  
  export default withBreadcrumbs()(bread);

  // import React from 'react';
// import { Route, Link } from 'react-router-dom';
// import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

// const routes = {
//     '/': '',
//     '/assignments': 'Assignments',
//     '/assignments/:assignment_id/:student_id': ({assignment_id, student_id}) => `Student - ${student_id}`,
// };

// const findRouteName = url => routes[url];

// const getPaths = (pathname) => {
//     const paths = ['/'];

//     if (pathname === '/') return paths;

//     pathname.split('/').reduce((prev, curr, index) => {
//         const currPath = `${prev}/${curr}`;
//         paths.push(currPath);
//         return currPath;
//     });

//     return paths;
  
// };

// const BreadcrumbsItem = ({ match, ...rest }) => {
//     const routeName = findRouteName(match.url);
//     if (routeName) {
//         return (
//             match.isExact ?
//                 (
//                     <BreadcrumbItem active>{routeName}</BreadcrumbItem>
//                 ) :
//                 (
//                     <BreadcrumbItem>
//                         <Link to={match.url || ''}>
//                             {routeName}
//                         </Link>
//                     </BreadcrumbItem>
//                 )
//         );
//     }
//     return null;
// };

// const Breadcrumbs = ({ location : { pathname }, match, ...rest }) => {
//     const paths = getPaths(pathname);
//     return (
//         <Breadcrumb>
//             {paths.map(p => <Route path={p} component={BreadcrumbsItem} key={p}/>)}
//         </Breadcrumb>
//     );
// };

// export default props => (
//     <div>
//         <div className="container">
//             <Route path="/:path" component={Breadcrumbs} {...props} />
//         </div>
//     </div>
// );
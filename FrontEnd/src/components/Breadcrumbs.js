import React from 'react';
import { Route, Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem } from 'reactstrap';

const routes = {
  '/': 'Home',
  '/assignments': 'Assignments',
  '/assignments/undefined/undefined': 'Maidul?',
  '/settings/a/b': 'B',
};

const findRouteName = url => routes[url];

const getPaths = (pathname) => {
  const paths = ['/'];

  if (pathname === '/') return paths;

  pathname.split('/').reduce((prev, curr, index) => {
    const currPath = `${prev}/${curr}`;
    paths.push(currPath);
    return currPath;
  });

  return paths;
  
};

const BreadcrumbsItem = ({ match, ...rest }) => {
  const routeName = findRouteName(match.url);
  if (routeName) {
    return (
      match.isExact ?
      (
        <BreadcrumbItem active>{routeName}</BreadcrumbItem>
      ) :
      (
        <BreadcrumbItem>
          <Link to={match.url || ''}>
            {routeName}
          </Link>
        </BreadcrumbItem>
      )
    );
  }
  return null;
};

const Breadcrumbs = ({ location : { pathname }, match, ...rest }) => {
  const paths = getPaths(pathname);
  return (
    <Breadcrumb>
      {paths.map(p => <Route path={p} component={BreadcrumbsItem} />)}
    </Breadcrumb>
  );
};

export default props => (
  <div>
    <div className="container">
      <Route path="/:path" component={Breadcrumbs} {...props} />
    </div>
  </div>
);
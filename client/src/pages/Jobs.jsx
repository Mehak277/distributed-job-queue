import JobExplorer from "../components/JobExplorer";

export default function Jobs() {
  return <div className="page-stack"><JobExplorer title="All Jobs" description="Search, filter and manage every background job" pageSize={10} /></div>;
}
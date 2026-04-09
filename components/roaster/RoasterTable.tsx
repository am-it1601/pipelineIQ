import { BDMember } from "@/types/types";
import Datatable from "../custom/Datatable";
import { TEAM_ROASTER_COLUMNS } from "./roaster.columns";

const RoasterTable = ({ roaster }: { roaster: BDMember[] }) => {
  return <Datatable columns={TEAM_ROASTER_COLUMNS} data={roaster} />;
};

export default RoasterTable;

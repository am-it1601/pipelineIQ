import { Badge } from "../ui/badge"

const RoleLabel = ({ role }: { role: string }) => {
    return (
        <Badge className="capitalize">{role}</Badge>
    )
}

export default RoleLabel
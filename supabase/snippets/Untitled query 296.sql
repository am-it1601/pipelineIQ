SELECT table_name, column_name
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('users', 'groups', 'user_groups', 'group_permissions', 'permissions', 'memberships', 'roles', 'user_roles')
ORDER BY table_name, ordinal_position;
    #!/bin/bash

# Clear the screen
clear

# Read the hook type from the user input
echo -n "Enter hook type (mutation/query): "
read hook_type

if [ -z "$hook_type" ]; then
    echo "Hook type is required"
    exit 1
fi

# Check whether the hook_type is mutation or query
if [ "$hook_type" != "mutation" ] && [ "$hook_type" != "query" ]; then
    echo "Hook type must be mutation or query"
    exit 1
fi

# Read the hook name from the user input
echo -n "Enter hook name: "
read hook_name

if [ -z "$hook_name" ]; then
    echo "Hook name is required"
    exit 1
fi

# Read the service name from the user input
echo -n "Enter service name: "
read service_name

if [ -z "$service_name" ]; then
    echo "Service name is required"
    exit 1
fi

# Check if the hook file already exists
if [ -f "src/hooks/use$hook_name.js" ]; then
    echo "Hook already exists. Please choose a different hook name."
    exit 1
fi

# Create the hook file
touch "src/hooks/use$hook_name.js"

# Add the hook to the hook file
if [ "$hook_type" == "mutation" ]; then
    echo "import { useMutation } from '@tanstack/react-query';
import { $service_name } from '@USupport-components-library/services';
import { useError } from './useError';


export const use$hook_name = (
    onSuccess,
    onError
) => {
    return useMutation({
        mutationFn: async (data) => {

        } ,
        onSuccess,
        onError: (error) => {
            const {message: errorMessage} = useError(error)
            onError(errorMessage)
        }
    });
}; 
export default use$hook_name;
" >> "src/hooks/use$hook_name.js"
else
    echo "import { useQuery } from '@tanstack/react-query';
import { $service_name } from '@USupport-components-library/services';

export const use$hook_name = () => {
    return useQuery({
        queryKey: [\"$hook_name\"],
        queryFn: () => {}
    });
};
export default use$hook_name;
 " >> "src/hooks/use$hook_name.js"
fi

# Add the hook to the hooks index file
echo "export { default as use$hook_name } from './use$hook_name';" >> "src/hooks/index.js"

# Output to the user's console 
echo "Successfully created use$hook_name hook in src/hooks"
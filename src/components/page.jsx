import {Box} from "@mui/material";
import PropTypes from "prop-types";

const PageBase = ({children}) => {

    return (
        <Box>
            {children}
        </Box>
    )
}
PageBase.propTypes = {
    children: PropTypes.node.isRequired,
}

export default PageBase
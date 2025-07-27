from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from core.manage_reports import manage_reports
from core.rca_summeries import get_all_firestore_data
from core.all_reports import get_all_reports
from agents.commuter_rerouter.main import reroute_handler
from agents.commuter_rerouter.custom_route import get_custom_route
from agents.commuter_rerouter.eco_route import get_eco_friendly_route
from agents.commuter_rerouter.fastest_route import get_fastest_route
from agents.commuter_rerouter.notifier import notify_user
from agents.commuter_rerouter.parking_suggestor import suggest_parking
from agents.commuter_rerouter.safe_route import get_safe_route

set_global_options(max_instances=10)

# No need to call https_fn.on_request here
# The decorator should be applied in the manage_reports function definition

# Note: signup and signin are commented out as they are not implemented
# from core.signup import signup
# from core.signin import signin

from firebase_functions import https_fn
from firebase_functions.options import set_global_options
from core.manage_reports import manage_reports
# from core.signup import signup
# from core.signin import signin

set_global_options(max_instances=10)

# No need to call https_fn.on_request here
# The decorator should be applied in the manage_reports function definition

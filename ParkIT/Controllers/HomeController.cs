using Microsoft.AspNetCore.Mvc; // Required for MVC controllers
using Microsoft.Extensions.Logging; // Required for ILogger
using System.Diagnostics; // Required for Activity
using ParkIT.Models; // Required for ErrorViewModel

namespace ParkIT.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        // Constructor for dependency injection
        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        // The Index action that returns the Index view
        public IActionResult Index()
        {
            return View();
        }

        // The Privacy action that returns the Privacy view
        public IActionResult Privacy()
        {
            return View();
        }

        // The Error action to handle errors, passing in an ErrorViewModel
        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
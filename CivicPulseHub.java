import java.util.*;

// Complaint Class
class Complaint {
    int id;
    String name;
    String issue;
    String status;

    Complaint(int id, String name, String issue) {
        this.id = id;
        this.name = name;
        this.issue = issue;
        this.status = "Pending";
    }

    void display() {
        System.out.println("ID: " + id + 
                           ", Name: " + name + 
                           ", Issue: " + issue + 
                           ", Status: " + status);
    }
}

public class CivicPulseHub {

    static ArrayList<Complaint> complaints = new ArrayList<>();
    static Scanner sc = new Scanner(System.in);
    static int idCounter = 1;

    static void addComplaint() {
        System.out.print("Enter your name: ");
        String name = sc.nextLine();

        System.out.print("Enter issue: ");
        String issue = sc.nextLine();

        Complaint c = new Complaint(idCounter++, name, issue);
        complaints.add(c);

        System.out.println("Complaint Registered Successfully!");
    }

    static void viewComplaints() {
        if (complaints.isEmpty()) {
            System.out.println("No complaints found.");
            return;
        }

        for (Complaint c : complaints) {
            c.display();
        }
    }

    static void updateStatus() {
        System.out.print("Enter Complaint ID: ");
        int id = sc.nextInt();
        sc.nextLine();

        for (Complaint c : complaints) {
            if (c.id == id) {
                System.out.print("Enter new status: ");
                c.status = sc.nextLine();
                System.out.println("Status Updated!");
                return;
            }
        }

        System.out.println("Complaint not found!");
    }

    public static void main(String[] args) {
        while (true) {
            System.out.println("\n--- CivicPulse Hub ---");
            System.out.println("1. Add Complaint");
            System.out.println("2. View Complaints");
            System.out.println("3. Update Status");
            System.out.println("4. Exit");
            System.out.print("Choose option: ");

            int choice = sc.nextInt();
            sc.nextLine();

            switch (choice) {
                case 1: addComplaint(); break;
                case 2: viewComplaints(); break;
                case 3: updateStatus(); break;
                case 4: System.exit(0);
                default: System.out.println("Invalid choice!");
            }
        }
    }
}

import javax.swing.*;
import javax.swing.border.Border;
import javax.swing.border.EmptyBorder;
import java.awt.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.MouseAdapter;
import java.awt.event.MouseEvent;

public class TalosLoginApp extends JFrame {
    private static final Color PRIMARY_GREEN = new Color(26, 90, 58);
    private static final Color HOVER_GREEN = new Color(15, 61, 38);
    private static final Color LIGHT_GRAY = new Color(245, 247, 250);
    private static final Color BORDER_GRAY = new Color(229, 229, 229);
    private static final Color TEXT_GRAY = new Color(102, 102, 102);
    private static final Color DARK_TEXT = new Color(51, 51, 51);
    private static final String SUPPORT_EMAIL = "support@talos-hvac.com";

    private JTextField usernameField;
    private JPasswordField passwordField;
    private JButton loginButton;
    private JButton forgotPasswordButton;
    private JButton forgotUsernameButton;
    private JButton getDemoButton;

    public TalosLoginApp() {
        initializeUI();
    }

    private void initializeUI() {
        setTitle("Talos HVAC - Login Portal");
        setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        setResizable(false);

        // Create main panel with gradient background
        JPanel mainPanel = new JPanel() {
            @Override
            protected void paintComponent(Graphics g) {
                super.paintComponent(g);
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);

                // Create gradient background
                GradientPaint gradient = new GradientPaint(0, 0, LIGHT_GRAY,
                                                          getWidth(), getHeight(),
                                                          new Color(195, 207, 226));
                g2d.setPaint(gradient);
                g2d.fillRect(0, 0, getWidth(), getHeight());

                // Add subtle grid pattern
                g2d.setColor(new Color(255, 255, 255, 25));
                g2d.setStroke(new BasicStroke(0.5f));
                for (int i = 0; i < getWidth(); i += 20) {
                    g2d.drawLine(i, 0, i, getHeight());
                }
                for (int i = 0; i < getHeight(); i += 20) {
                    g2d.drawLine(0, i, getWidth(), i);
                }
            }
        };
        mainPanel.setLayout(new BorderLayout());

        // Create login panel
        JPanel loginPanel = createLoginPanel();
        mainPanel.add(loginPanel, BorderLayout.CENTER);

        add(mainPanel);

        // Set window properties
        setSize(450, 600);
        setLocationRelativeTo(null);

        // Focus on username field when window opens
        SwingUtilities.invokeLater(() -> usernameField.requestFocusInWindow());
    }

    private JPanel createLoginPanel() {
        JPanel panel = new JPanel();
        panel.setOpaque(false);
        panel.setLayout(new BoxLayout(panel, BoxLayout.Y_AXIS));
        panel.setBorder(new EmptyBorder(40, 40, 40, 40));

        // Logo and company name
        JPanel logoPanel = createLogoPanel();
        panel.add(logoPanel);
        panel.add(Box.createRigidArea(new Dimension(0, 40)));

        // Login form container
        JPanel formContainer = createFormContainer();
        panel.add(formContainer);

        return panel;
    }

    private JPanel createLogoPanel() {
        JPanel logoPanel = new JPanel();
        logoPanel.setOpaque(false);
        logoPanel.setLayout(new BoxLayout(logoPanel, BoxLayout.Y_AXIS));

        // Company logo (using text for now)
        JLabel logoLabel = new JLabel("🔧");
        logoLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 48));
        logoLabel.setForeground(PRIMARY_GREEN);
        logoLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Company name
        JLabel companyLabel = new JLabel("Talos");
        companyLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 36));
        companyLabel.setForeground(PRIMARY_GREEN);
        companyLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        // Tagline
        JLabel taglineLabel = new JLabel("HVAC Hiring Solutions");
        taglineLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
        taglineLabel.setForeground(TEXT_GRAY);
        taglineLabel.setAlignmentX(Component.CENTER_ALIGNMENT);

        logoPanel.add(logoLabel);
        logoPanel.add(Box.createRigidArea(new Dimension(0, 10)));
        logoPanel.add(companyLabel);
        logoPanel.add(Box.createRigidArea(new Dimension(0, 5)));
        logoPanel.add(taglineLabel);

        return logoPanel;
    }

    private JPanel createFormContainer() {
        JPanel container = new JPanel();
        container.setBackground(Color.WHITE);
        container.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_GRAY, 1),
            new EmptyBorder(30, 30, 30, 30)
        ));
        container.setLayout(new BoxLayout(container, BoxLayout.Y_AXIS));

        // Form title
        JLabel titleLabel = new JLabel("Welcome Back");
        titleLabel.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 24));
        titleLabel.setForeground(DARK_TEXT);
        titleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        container.add(titleLabel);
        container.add(Box.createRigidArea(new Dimension(0, 5)));

        JLabel subtitleLabel = new JLabel("Sign in to your Talos account");
        subtitleLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
        subtitleLabel.setForeground(TEXT_GRAY);
        subtitleLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        container.add(subtitleLabel);
        container.add(Box.createRigidArea(new Dimension(0, 30)));

        // Username field
        container.add(createFieldLabel("Username or Email"));
        usernameField = createStyledTextField();
        container.add(usernameField);
        container.add(Box.createRigidArea(new Dimension(0, 20)));

        // Password field
        container.add(createFieldLabel("Password"));
        passwordField = createStyledPasswordField();
        container.add(passwordField);
        container.add(Box.createRigidArea(new Dimension(0, 15)));

        // Forgot links panel
        JPanel forgotPanel = createForgotLinksPanel();
        container.add(forgotPanel);
        container.add(Box.createRigidArea(new Dimension(0, 25)));

        // Login button
        loginButton = createPrimaryButton("Sign In", this::handleLogin);
        container.add(loginButton);
        container.add(Box.createRigidArea(new Dimension(0, 20)));

        // Get Demo button
        getDemoButton = createSecondaryButton("Get Demo", this::handleGetDemo);
        container.add(getDemoButton);
        container.add(Box.createRigidArea(new Dimension(0, 30)));

        // Support text
        JLabel supportLabel = new JLabel("<html><div style='text-align: center;'>" +
            "If you are having trouble logging in,<br>" +
            "please email <span style='color: #1a5a3a;'>" + SUPPORT_EMAIL + "</span>" +
            "</div></html>");
        supportLabel.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
        supportLabel.setForeground(TEXT_GRAY);
        supportLabel.setAlignmentX(Component.CENTER_ALIGNMENT);
        container.add(supportLabel);

        return container;
    }

    private JLabel createFieldLabel(String text) {
        JLabel label = new JLabel(text);
        label.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 13));
        label.setForeground(DARK_TEXT);
        label.setAlignmentX(Component.LEFT_ALIGNMENT);
        return label;
    }

    private JTextField createStyledTextField() {
        JTextField field = new JTextField();
        field.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
        field.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_GRAY, 2),
            new EmptyBorder(8, 12, 8, 12)
        ));
        field.setMaximumSize(new Dimension(Integer.MAX_VALUE, 35));
        field.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Add focus effects
        field.addFocusListener(new java.awt.event.FocusAdapter() {
            public void focusGained(java.awt.event.FocusEvent e) {
                field.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(PRIMARY_GREEN, 2),
                    new EmptyBorder(8, 12, 8, 12)
                ));
            }

            public void focusLost(java.awt.event.FocusEvent e) {
                field.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(BORDER_GRAY, 2),
                    new EmptyBorder(8, 12, 8, 12)
                ));
            }
        });

        return field;
    }

    private JPasswordField createStyledPasswordField() {
        JPasswordField field = new JPasswordField();
        field.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 14));
        field.setBorder(BorderFactory.createCompoundBorder(
            BorderFactory.createLineBorder(BORDER_GRAY, 2),
            new EmptyBorder(8, 12, 8, 12)
        ));
        field.setMaximumSize(new Dimension(Integer.MAX_VALUE, 35));
        field.setAlignmentX(Component.LEFT_ALIGNMENT);

        // Add focus effects
        field.addFocusListener(new java.awt.event.FocusAdapter() {
            public void focusGained(java.awt.event.FocusEvent e) {
                field.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(PRIMARY_GREEN, 2),
                    new EmptyBorder(8, 12, 8, 12)
                ));
            }

            public void focusLost(java.awt.event.FocusEvent e) {
                field.setBorder(BorderFactory.createCompoundBorder(
                    BorderFactory.createLineBorder(BORDER_GRAY, 2),
                    new EmptyBorder(8, 12, 8, 12)
                ));
            }
        });

        return field;
    }

    private JPanel createForgotLinksPanel() {
        JPanel panel = new JPanel(new FlowLayout(FlowLayout.CENTER, 10, 0));
        panel.setOpaque(false);

        forgotPasswordButton = createLinkButton("Forgot Password?", this::handleForgotPassword);
        forgotUsernameButton = createLinkButton("Forgot Username?", this::handleForgotUsername);

        panel.add(forgotPasswordButton);
        panel.add(new JLabel("|"));
        panel.add(forgotUsernameButton);

        return panel;
    }

    private JButton createPrimaryButton(String text, ActionListener action) {
        JButton button = new JButton(text) {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                if (getModel().isPressed()) {
                    g2d.setColor(HOVER_GREEN);
                } else if (getModel().isRollover()) {
                    g2d.setColor(HOVER_GREEN);
                } else {
                    g2d.setColor(PRIMARY_GREEN);
                }

                g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);

                // Draw text
                g2d.setColor(Color.WHITE);
                g2d.setFont(getFont());
                FontMetrics fm = g2d.getFontMetrics();
                int textWidth = fm.stringWidth(getText());
                int textHeight = fm.getHeight();
                int x = (getWidth() - textWidth) / 2;
                int y = (getHeight() - textHeight) / 2 + fm.getAscent();
                g2d.drawString(getText(), x, y);
            }
        };

        button.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
        button.setForeground(Color.WHITE);
        button.setBackground(PRIMARY_GREEN);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(0, 45));
        button.setMaximumSize(new Dimension(Integer.MAX_VALUE, 45));
        button.setAlignmentX(Component.CENTER_ALIGNMENT);
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));

        button.addActionListener(action);

        return button;
    }

    private JButton createSecondaryButton(String text, ActionListener action) {
        JButton button = new JButton(text) {
            @Override
            protected void paintComponent(Graphics g) {
                Graphics2D g2d = (Graphics2D) g;
                g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

                // Draw border
                if (getModel().isPressed()) {
                    g2d.setColor(HOVER_GREEN);
                    g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);
                } else if (getModel().isRollover()) {
                    g2d.setColor(HOVER_GREEN);
                    g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);
                } else {
                    g2d.setColor(Color.WHITE);
                    g2d.fillRoundRect(0, 0, getWidth(), getHeight(), 8, 8);
                    g2d.setColor(PRIMARY_GREEN);
                    g2d.setStroke(new BasicStroke(2));
                    g2d.drawRoundRect(1, 1, getWidth()-3, getHeight()-3, 8, 8);
                }

                // Draw text
                if (getModel().isPressed() || getModel().isRollover()) {
                    g2d.setColor(Color.WHITE);
                } else {
                    g2d.setColor(PRIMARY_GREEN);
                }

                g2d.setFont(getFont());
                FontMetrics fm = g2d.getFontMetrics();
                int textWidth = fm.stringWidth(getText());
                int textHeight = fm.getHeight();
                int x = (getWidth() - textWidth) / 2;
                int y = (getHeight() - textHeight) / 2 + fm.getAscent();
                g2d.drawString(getText(), x, y);
            }
        };

        button.setFont(new Font(Font.SANS_SERIF, Font.BOLD, 14));
        button.setForeground(PRIMARY_GREEN);
        button.setBackground(Color.WHITE);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setPreferredSize(new Dimension(0, 45));
        button.setMaximumSize(new Dimension(Integer.MAX_VALUE, 45));
        button.setAlignmentX(Component.CENTER_ALIGNMENT);
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));

        button.addActionListener(action);

        return button;
    }

    private JButton createLinkButton(String text, ActionListener action) {
        JButton button = new JButton(text);
        button.setFont(new Font(Font.SANS_SERIF, Font.PLAIN, 12));
        button.setForeground(PRIMARY_GREEN);
        button.setBorderPainted(false);
        button.setContentAreaFilled(false);
        button.setFocusPainted(false);
        button.setCursor(new Cursor(Cursor.HAND_CURSOR));

        button.addMouseListener(new MouseAdapter() {
            @Override
            public void mouseEntered(MouseEvent e) {
                button.setForeground(HOVER_GREEN);
            }

            @Override
            public void mouseExited(MouseEvent e) {
                button.setForeground(PRIMARY_GREEN);
            }
        });

        button.addActionListener(action);

        return button;
    }

    private void handleLogin(ActionEvent e) {
        String username = usernameField.getText().trim();
        String password = new String(passwordField.getPassword());

        if (username.isEmpty() || password.isEmpty()) {
            JOptionPane.showMessageDialog(this,
                "Please enter both username and password.",
                "Login Required",
                JOptionPane.WARNING_MESSAGE);
            return;
        }

        // Simulate login process
        loginButton.setText("Signing In...");
        loginButton.setEnabled(false);

        SwingUtilities.invokeLater(() -> {
            try {
                Thread.sleep(1000); // Simulate network delay
            } catch (InterruptedException ex) {
                Thread.currentThread().interrupt();
            }

            SwingUtilities.invokeLater(() -> {
                loginButton.setText("Sign In");
                loginButton.setEnabled(true);

                JOptionPane.showMessageDialog(this,
                    "Login successful! Welcome to Talos HVAC.",
                    "Success",
                    JOptionPane.INFORMATION_MESSAGE);
            });
        });
    }

    private void handleForgotPassword(ActionEvent e) {
        String email = JOptionPane.showInputDialog(this,
            "Enter your email address to reset your password:",
            "Forgot Password",
            JOptionPane.QUESTION_MESSAGE);

        if (email != null && !email.trim().isEmpty()) {
            JOptionPane.showMessageDialog(this,
                "Password reset instructions have been sent to " + email,
                "Reset Email Sent",
                JOptionPane.INFORMATION_MESSAGE);
        }
    }

    private void handleForgotUsername(ActionEvent e) {
        String email = JOptionPane.showInputDialog(this,
            "Enter your email address to recover your username:",
            "Forgot Username",
            JOptionPane.QUESTION_MESSAGE);

        if (email != null && !email.trim().isEmpty()) {
            JOptionPane.showMessageDialog(this,
                "Username recovery instructions have been sent to " + email,
                "Recovery Email Sent",
                JOptionPane.INFORMATION_MESSAGE);
        }
    }

    private void handleGetDemo(ActionEvent e) {
        new DemoRequestDialog(this).setVisible(true);
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> {
            new TalosLoginApp().setVisible(true);
        });
    }
}